<script lang="ts">
	import type { DepositWizardData } from '../+layout';
	import { captureException } from '@sentry/sveltekit';
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import fsm from 'svelte-fsm';
	import { wizard } from 'wizard/store';
	import { formatUnits, parseUnits } from 'viem';
	import { simulateContract, writeContract, waitForTransactionReceipt } from '@wagmi/core';
	import { getSharePrice } from '$lib/eth-defi/enzyme';
	import { getSignedArguments } from '$lib/eth-defi/eip-3009';
	import {
		type ErrorInfo,
		approveTokenTransfer,
		extractErrorInfo,
		formatBalance,
		getTokenInfo,
		getTokenAllowance,
		getExpectedBlockTime
	} from '$lib/eth-defi/helpers';
	import { config, wallet } from '$lib/wallet/client';
	import { Button, Alert, CryptoAddressWidget, EntitySymbol, MoneyInput } from '$lib/components';
	import WalletInfo from '$lib/wallet/WalletInfo.svelte';
	import WalletInfoItem from '$lib/wallet/WalletInfoItem.svelte';
	import PaymentError from './PaymentError.svelte';
	import { getProgressBar } from '$lib/helpers/progressbar';
	import { getExplorerUrl } from '$lib/helpers/chain';
	import { formatNumber } from '$lib/helpers/formatters';
	import { getLogoUrl } from '$lib/helpers/assets';

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

	const progressBar = getProgressBar(-1, getExpectedBlockTime(chainId));

	const transactionCopy = 'Click the transaction ID above to view the status in the blockchain explorer.';

	let paymentValue = '';
	let error: ErrorInfo | unknown | undefined = undefined;
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

	async function checkPreApproved() {
		const allowance = await getTokenAllowance(config, {
			chainId,
			address: denominationToken.address,
			owner: $wallet.address!,
			spender: contracts.comptroller
		});

		const value = parseUnits(paymentValue, denominationToken.decimals);
		return value <= allowance;
	}

	function approveTransfer() {
		return approveTokenTransfer(config, {
			chainId,
			address: denominationToken.address,
			spender: contracts.comptroller,
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

	const payment = fsm('initial', {
		'*': {
			fail: 'failed'
		},

		initial: {
			_enter() {
				progressBar.reset();

				getVaultSharePrice()
					.then((value) => (sharePrice = value))
					.catch(() => {}); // no-op
			},

			// restore state on wizard back/next navigation
			restore(state) {
				if (['authorizing', 'approving', 'confirming'].includes(state)) {
					error = { name: 'NavigationLostStateError', state };
					return 'failed';
				}
				return state;
			},

			authorizeOrApprove() {
				if (canForwardPayment) {
					authorizeTransfer().then(payment.confirm).catch(payment.fail);
					return 'authorizing';
				}

				checkPreApproved()
					.then(payment.handleCheck)
					.catch(() => payment.handleCheck(false));
				return 'checkingPreApproved';
			}
		},

		authorizing: {
			confirm(signedArgs) {
				confirmPayment(signedArgs).then(payment.process).catch(payment.fail);
				return 'confirming';
			}
		},

		checkingPreApproved: {
			handleCheck(approved: boolean) {
				if (approved) return 'preApproved';
				approveTransfer().then(payment.process).catch(payment.fail);
				return 'approving';
			}
		},

		preApproved: {
			buyShares() {
				const buyer = $wallet.address;
				const value = parseUnits(paymentValue, denominationTokenInfo.decimals);
				confirmPayment([buyer, value]).then(payment.process).catch(payment.fail);
				return 'confirming';
			}
		},

		approving: {
			process(txId) {
				approvalTxId = txId;
				return 'processingApproval';
			}
		},

		processingApproval: {
			_enter({ event }) {
				progressBar.start(event === 'restore' ? 50 : 0);
				waitForTransactionReceipt(config, { hash: approvalTxId! }).then(payment.finish).catch(payment.fail);
			},

			_exit() {
				progressBar.finish();
			},

			finish(receipt) {
				if (receipt.status === 'success') return 'approved';

				error = {
					name: 'TransactionRevertedError',
					shortMessage: 'Transaction execution reverted.',
					cause: receipt,
					state: 'processingApproval'
				};
				return 'failed';
			}
		},

		approved: {
			_enter({ event }) {
				if (event === 'restore') {
					progressBar.finish(0);
				}
			},

			_exit() {
				progressBar.reset();
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
			}
		},

		processing: {
			_enter({ event }) {
				progressBar.start(event === 'restore' ? 50 : 0);
				waitForTransactionReceipt(config, { hash: paymentTxId! }).then(payment.finish).catch(payment.fail);
			},

			_exit() {
				progressBar.finish();
			},

			finish(receipt) {
				if (receipt.status === 'success') return 'completed';
				error = { name: 'TransactionRevertedError', cause: receipt, state: 'processing' };
				return 'failed';
			}
		},

		failed: {
			_enter({ from, event, args: [err] }) {
				if (event === 'fail') {
					captureException(err);
					error = extractErrorInfo(err, from as string);
				}
			},

			retry() {
				return paymentTxId ? 'processing' : 'initial';
			}
		},

		completed: {
			_enter({ event }) {
				if (event === 'restore') {
					progressBar.finish(0);
				}
				wizard.toggleComplete('payment');
			}
		}
	});

	// capture/restore ephemeral page state when navigating away from and back to page
	// NOTE: Svelte's "snapshot" feature only works with browser-native back/forward nav
	beforeNavigate(() => {
		wizard.updateData({
			paymentSnapshot: { state: $payment, paymentValue, sharePrice, approvalTxId, paymentTxId, error }
		});
	});

	afterNavigate(() => {
		const { state, ...rest } = $wizard.data.paymentSnapshot ?? {};
		({ paymentValue, sharePrice, approvalTxId, paymentTxId, error } = rest);
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
				required
				min={formatUnits(1n, denominationToken.decimals)}
				max={formatBalance(denominationToken)}
			>
				Estimated shares:
				{getEstimatedShares(paymentValue, sharePrice)}
			</MoneyInput>

			{#if !['processing', 'completed'].includes($payment)}
				{#if canForwardPayment}
					<Button submit disabled={$payment !== 'initial'}>Make payment</Button>
				{:else}
					<div class="buttons">
						<Button submit disabled={$payment !== 'initial'}>
							Approve {denominationToken.label}
						</Button>
						<Button disabled={!['preApproved', 'approved'].includes($payment)} on:click={payment.buyShares}>
							Buy shares
						</Button>
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

			{#if ['preApproved', 'approved'].includes($payment)}
				<Alert size="sm" status="success" title="Transfer approved">
					{denominationToken.label} spending cap
					{#if $payment === 'preApproved'}
						has already been
					{/if}
					approved. Please click "Buy shares" to complete your purchase.
				</Alert>
			{/if}

			{#if $payment === 'processingApproval'}
				<Alert size="sm" status="info" title="Approval processing">
					The duration of processing may vary based on factors such as blockchain congestion and gas specified.
					{transactionCopy}
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
					{transactionCopy}
				</Alert>
			{/if}

			{#if $payment === 'failed'}
				<Alert size="sm" status="error" title="Error">
					<PaymentError {error} symbol={denominationToken.symbol} {transactionCopy} />
					<Button slot="cta" size="xs" label="Try again" on:click={payment.retry} />
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
