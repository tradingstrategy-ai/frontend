<script lang="ts">
	import type { DepositWizardData } from '../+layout.js';
	import { captureException } from '@sentry/sveltekit';
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import fsm from 'svelte-fsm';
	import { wizard } from 'wizard/store';
	import { formatUnits, parseUnits } from 'viem';
	import { simulateContract, writeContract, getTransactionReceipt, waitForTransactionReceipt } from '@wagmi/core';
	import { getSharePrice } from '$lib/eth-defi/enzyme.js';
	import { getSignedArguments } from '$lib/eth-defi/eip-3009';
	import { approveTokenTransfer, formatBalance, getTokenInfo } from '$lib/eth-defi/helpers';
	import { config, wallet, WalletInfo, WalletInfoItem } from '$lib/wallet';
	import { Button, Alert, CryptoAddressWidget, EntitySymbol, MoneyInput } from '$lib/components';
	import { getChain, getExplorerUrl } from '$lib/helpers/chain';
	import { formatNumber } from '$lib/helpers/formatters.js';
	import { getLogoUrl } from '$lib/helpers/assets.js';

	export let data;
	const { paymentContract, tosRequired } = data;

	// Delay (ms) between signature request and payment transaction
	const WALLET_PAYMENT_DELAY = 500;

	// Share price slippage tollerance - used when calculating minSharesQuantity
	const SLIPPAGE_TOLERANCE = 0.02;

	const {
		chainId,
		canForwardPayment,
		contracts,
		denominationToken,
		denominationTokenInfo,
		nativeCurrency,
		tosHash,
		tosSignature
	} = $wizard.data as Required<DepositWizardData>;
	const chain = getChain(chainId)!;

	// set to value from 0-100 to display progress bar
	const progressBar = tweened(-1, { easing: cubicOut });

	const viewTransactionCopy = 'Click the transaction ID above to view the status in the blockchain explorer.';

	let paymentValue = '';
	let errorMessage = '';
	let approvalTxId: Address | undefined = undefined;
	let paymentTxId: Address | undefined = undefined;
	let sharePrice: number | undefined = undefined;

	// Disable the "Cancel" button once a transaction has been initiated
	$: wizard.toggleComplete('meta:no-return', paymentTxId !== undefined);

	function getVaultSharePrice() {
		return getSharePrice(config, {
			calculator: contracts.fund_value_calculator,
			vault: contracts.vault,
			denominationToken
		});
	}

	// TODO: extract to a helper module
	function calcMinSharesQuantity(value: Numberlike, sharePrice: number, decimals: number) {
		const minSharesDecimal = Number(value) / (sharePrice * (1 + SLIPPAGE_TOLERANCE));
		return parseUnits(String(minSharesDecimal), decimals);
	}

	function getEstimatedShares(paymentValue: Numberlike, sharePrice: number | undefined) {
		const value = Number(paymentValue || 0);
		let estimated: number | undefined = undefined;
		if (value === 0) {
			estimated = 0;
		} else if (sharePrice) {
			estimated = value / sharePrice;
		}
		return formatNumber(estimated, 2, 4);
	}

	function authorizeTransfer() {
		return getSignedArguments(config, {
			chainId,
			token: denominationTokenInfo,
			transferMethod: 'TransferWithAuthorization',
			from: $wallet.address!,
			to: paymentContract.address,
			value: parseUnits(paymentValue, denominationTokenInfo.decimals)
		});
	}

	function approveTransfer() {
		return approveTokenTransfer(config, {
			chainId,
			address: denominationToken.address,
			sender: contracts.comptroller,
			value: parseUnits(paymentValue, denominationToken.decimals)
		});
	}

	async function confirmPayment(args: any[] = []) {
		const [curSharePrice, vaultToken] = await Promise.all([
			// re-fetch share price if not previously set
			sharePrice ?? getVaultSharePrice(),
			// get vault token info for decimals unit conversion
			getTokenInfo(config, { address: contracts.vault }),
			// short delay to address Rabby wallet race condition
			new Promise((r) => setTimeout(r, WALLET_PAYMENT_DELAY))
		]);

		args.push(calcMinSharesQuantity(paymentValue, curSharePrice, vaultToken.decimals));

		if (tosRequired) {
			args.push(tosHash, tosSignature);
		}

		const { request } = await simulateContract(config, { ...paymentContract, args });
		return writeContract(config, request);
	}

	function waitForTransactionWithProgress(event: MaybeString, hash: Address) {
		progressBar.set(0, { duration: 0 });
		let duration = 20_000;

		if (event === 'restore') {
			// try fetching receipt in case transaction already completed
			getTransactionReceipt(config, { hash })
				.then(payment.finish)
				.catch(() => {});
			progressBar.set(50, { duration: 0 });
			duration *= 0.5;
		}

		// wait for pending transaction
		waitForTransactionReceipt(config, { hash }).then(payment.finish).catch(payment.fail);
		progressBar.set(100, { duration });
	}

	const payment = fsm('initial', {
		initial: {
			_enter() {
				progressBar.set(-1, { duration: 0 });

				getVaultSharePrice()
					.then((value) => (sharePrice = value))
					.catch(() => {}); // no-op
			},

			// restore state on wizard back/next navigation
			restore(state) {
				if (state === 'authorizing' || state === 'confirming') {
					errorMessage = `Wallet request state lost due to window navigation;
						please cancel wallet request and try again.`;
					return 'failed';
				}
				return state;
			},

			authorizeOrApprove() {
				if (canForwardPayment) {
					authorizeTransfer().then(payment.confirm).catch(payment.fail);
					return 'authorizing';
				}

				approveTransfer().then(payment.process).catch(payment.fail);
				return 'approving';
			}
		},

		authorizing: {
			confirm(signedArgs) {
				confirmPayment(signedArgs).then(payment.process).catch(payment.fail);
				return 'confirming';
			},

			fail(err) {
				const eventId = captureException(err);
				console.error('authorizeTransfer error:', eventId, err);
				if (err.name === 'UnknownRpcError' && err.details.includes('eth_signTypedData_v4')) {
					errorMessage = `
						Authorization failed because your wallet does not support typed data signatures.
						Consider using TrustWallet, Rainbow or a browser extension wallet like MetaMask.
					`;
				} else if (err.name === 'InvalidInputRpcError' && err.details.includes('User cancelled')) {
					errorMessage = `
						Authorization to transfer ${denominationToken.symbol} tokens from your wallet was refused.
						To proceed with share purchase, please try again and accept the signature request.
					`;
				} else {
					errorMessage = `Authorization to transfer ${denominationToken.symbol} tokens from your wallet failed. `;
					errorMessage += err.shortMessage ?? 'Failure reason unknown.';
				}
				return 'failed';
			}
		},

		approving: {
			process(txId) {
				approvalTxId = txId;
				return 'processingApproval';
			},

			fail(err) {
				const eventId = captureException(err);
				console.error('approveTransfer error:', eventId, err);
				errorMessage = `Transfer approval from wallet account failed. ${err.shortMessage}`;
				return 'failed';
			}
		},

		processingApproval: {
			_enter({ event }) {
				waitForTransactionWithProgress(event, approvalTxId!);
			},

			_exit() {
				progressBar.set(100, { duration: 100 });
			},

			finish(receipt) {
				if (receipt.status === 'success') return 'approved';
				console.error('waitForTransactionReceipt reverted:', receipt);
				errorMessage = `Transaction execution reverted. ${viewTransactionCopy}`;
				return 'failed';
			},

			fail(err) {
				const eventId = captureException(err);
				console.error('waitForTransactionReceipt error:', eventId, err);
				if (err.name === 'CallExecutionError') {
					errorMessage = `${err.shortMessage} ${viewTransactionCopy}`;
				} else {
					errorMessage = `Unable to verify transaction status. ${viewTransactionCopy}`;
				}
				return 'failed';
			}
		},

		approved: {
			_enter({ event }) {
				if (event === 'restore') {
					progressBar.set(100, { duration: 0 });
				}
			},

			_exit() {
				progressBar.set(-1, { duration: 0 });
			},

			buyShares() {
				const buyer = $wallet.address;
				const value = parseUnits(paymentValue, denominationTokenInfo.decimals);
				confirmPayment([buyer, value]).then(payment.process).catch(payment.fail);
				return 'confirming';
			}
		},

		confirming: {
			process(txId) {
				paymentTxId = txId;
				return 'processing';
			},

			fail(err) {
				const eventId = captureException(err);
				console.error('confirmPayment error:', eventId, err);
				if (err.name === 'GetSharePriceError') {
					errorMessage = `
						Error fetching share price; unable to calculate minSharesQuantity. Aborting payment
						contract request.
					`;
				} else {
					errorMessage = 'Payment confirmation from wallet account failed. ';
					errorMessage += err.shortMessage ?? 'Failure reason unknown.';
				}
				return 'failed';
			}
		},

		processing: {
			_enter({ event }) {
				waitForTransactionWithProgress(event, paymentTxId!);
			},

			_exit() {
				progressBar.set(100, { duration: 100 });
			},

			finish(receipt) {
				if (receipt.status === 'success') return 'completed';
				console.error('waitForTransactionReceipt reverted:', receipt);
				errorMessage = `Transaction execution reverted. ${viewTransactionCopy}`;
				return 'failed';
			},

			fail(err) {
				const eventId = captureException(err);
				console.error('waitForTransactionReceipt error:', eventId, err);
				if (err.name === 'CallExecutionError') {
					errorMessage = `${err.shortMessage} ${viewTransactionCopy}`;
				} else {
					errorMessage = `Unable to verify transaction status. ${viewTransactionCopy}`;
				}
				return 'failed';
			}
		},

		failed: {
			retry() {
				return paymentTxId ? 'processing' : 'initial';
			}
		},

		completed: {
			_enter({ event }) {
				if (event === 'restore') {
					progressBar.set(100, { duration: 0 });
				}
				wizard.toggleComplete('payment');
			}
		}
	});

	// capture/restore ephemeral page state when navigating away from and back to page
	// NOTE: Svelte's "snapshot" feature only works with browser-native back/forward nav
	beforeNavigate(() => {
		wizard.updateData({
			paymentSnapshot: { state: $payment, paymentValue, sharePrice, approvalTxId, paymentTxId, errorMessage }
		});
	});

	afterNavigate(() => {
		const { state, ...rest } = $wizard.data?.paymentSnapshot ?? {};
		({ paymentValue, sharePrice, approvalTxId, paymentTxId, errorMessage } = rest);
		payment.restore(state);
	});
</script>

<div class="wallet-deposit">
	<section>
		<h3>Your current balance</h3>

		<WalletInfo alignValues="right">
			<WalletInfoItem>
				<EntitySymbol
					slot="label"
					size="1.5rem"
					label={nativeCurrency.symbol}
					logoUrl={getLogoUrl('token', nativeCurrency.symbol)}
				/>
				{formatBalance(nativeCurrency, 2, 4)}
			</WalletInfoItem>

			<WalletInfoItem>
				<EntitySymbol
					slot="label"
					size="1.5rem"
					label={denominationToken.label}
					logoUrl={getLogoUrl('token', denominationToken.symbol)}
				/>
				{formatBalance(denominationToken, 2, 4)}
			</WalletInfoItem>
		</WalletInfo>
	</section>

	<section>
		<header class="deposit-header">
			<h3 class="wide">Enter amount to deposit</h3>
			<h3 class="narrow">Deposit amount</h3>
			<Button
				secondary
				size="xs"
				on:click={() => (paymentValue = formatBalance(denominationToken))}
				disabled={paymentValue === formatBalance(denominationToken)}
			>
				Deposit all
				<span class="wide">{denominationToken.label}</span>
			</Button>
		</header>

		<form class="payment-form" on:submit|preventDefault={payment.authorizeOrApprove}>
			<MoneyInput
				bind:value={paymentValue}
				size="xl"
				token={denominationToken}
				disabled={$payment !== 'initial'}
				min={formatUnits(1n, denominationToken.decimals)}
				max={formatBalance(denominationToken)}
			>
				Estimated shares:
				{getEstimatedShares(paymentValue, sharePrice)}
			</MoneyInput>

			{#if !['processing', 'completed'].includes($payment)}
				{#if canForwardPayment}
					<Button submit disabled={!($payment === 'initial' && paymentValue)}>Make payment</Button>
				{:else}
					<div class="buttons">
						<Button submit disabled={!($payment === 'initial' && paymentValue)}>
							Approve {denominationToken.label}
						</Button>
						<Button disabled={$payment !== 'approved'} on:click={payment.buyShares}>Buy shares</Button>
					</div>
				{/if}
			{:else if paymentTxId}
				<div class="transaction-id">
					<h3>Transaction ID</h3>
					<CryptoAddressWidget address={paymentTxId} href={getExplorerUrl($wallet.chain, paymentTxId)} />
				</div>
			{/if}

			{#if $progressBar >= 0}
				<progress max="100" value={$progressBar} />
			{/if}

			{#if $payment === 'authorizing'}
				<Alert size="sm" status="info" title="Authorise transfer">
					Authorise the EIP-3009 transfer of {denominationToken.symbol} tokens from your wallet. If your wallet does not
					support the EIP-3009 transfer type, you will be prompted to sign a message and then send a transaction.
				</Alert>
			{/if}

			{#if $payment === 'approving'}
				<Alert size="sm" status="info" title="Approve transfer">
					Please approve the requested {denominationToken.label} spending cap in your wallet. This allows the designated
					amount of {denominationToken.label} to be transfered from your wallet to purchase shares.
				</Alert>
			{/if}

			{#if $payment === 'approved'}
				<Alert size="sm" status="success" title="Transfer approved">
					{denominationToken.label} spending cap approved. Please click "Buy shares" to complete your purchase.
				</Alert>
			{/if}

			{#if $payment === 'processingApproval'}
				<Alert size="sm" status="info" title="Approval processing">
					The duration of processing may vary based on factors such as blockchain congestion and gas specified.
					{viewTransactionCopy}
				</Alert>
			{/if}

			{#if $payment === 'confirming'}
				<Alert size="sm" status="info" title="Confirm transaction">
					Please confirm the transaction in your wallet in order submit your payment.
				</Alert>
			{/if}

			{#if $payment === 'processing'}
				<Alert size="sm" status="info" title="Payment processing">
					The duration of processing may vary based on factors such as blockchain congestion and gas specified.
					{viewTransactionCopy}
				</Alert>
			{/if}

			{#if $payment === 'failed'}
				<Alert size="sm" status="error" title="Error">
					{errorMessage}
					<Button slot="cta" size="sm" label="Try again" on:click={payment.retry} />
				</Alert>
			{/if}

			{#if $payment === 'completed'}
				<Alert size="sm" status="success" title="Payment completed">
					Your transaction completed successfully and the shares have been added to your wallet. Click "Next" below to
					review your share balance.
				</Alert>
			{/if}
		</form>
	</section>
</div>

<style>
	@container (width < 420px) {
		.wide {
			display: none;
		}
	}
	@container (width >= 420px) {
		.narrow {
			display: none;
		}
	}

	.wallet-deposit {
		display: grid;
		gap: var(--space-3xl);

		section {
			display: grid;
			gap: var(--space-ls);
		}

		h3 {
			color: var(--c-text-light);
			font: var(--f-ui-lg-medium);
			margin: 0;
		}

		.deposit-header {
			container-type: inline-size;
			display: grid;
			grid-template-columns: 1fr auto;
			align-items: center;
		}

		.payment-form {
			display: grid;
			gap: var(--space-xl);
		}

		.buttons {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
			gap: 0.75rem;
		}

		progress {
			width: 100%;
		}

		.transaction-id {
			display: grid;
			gap: var(--space-ss);
			justify-content: flex-start;
		}
	}
</style>
