<script lang="ts">
	import { wizard } from 'wizard/store';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import fsm from 'svelte-fsm';
	import type { FetchBalanceResult } from '@wagmi/core';
	import { getPublicClient, prepareWriteContract, writeContract, waitForTransaction } from '@wagmi/core';
	import { formatUnits, parseUnits } from 'viem';
	import { formatNumber } from '$lib/helpers/formatters';
	import { wallet, WalletInfo, WalletInfoItem } from '$lib/wallet';
	import { getExplorerUrl } from '$lib/helpers/chain';
	import { type SignedArguments, fetchTokenInfo, getSignedArguments } from '$lib/eth-defi/eip-3009';
	import paymentForwarderABI from '$lib/eth-defi/abi/VaultUSDCPaymentForwarder.json';
	import { Button, Alert, CryptoAddressWidget, EntitySymbol, MoneyInput } from '$lib/components';

	const contracts: Contracts = $wizard.data.contracts;
	const denominationToken: FetchBalanceResult = $wizard.data.denominationToken;
	const nativeCurrency: FetchBalanceResult = $wizard.data.nativeCurrency;

	let paymentValue: MaybeString;
	let errorMessage: MaybeString;
	let transactionId: Maybe<Address>;
	let paymentInput: MoneyInput;

	const progressBar = tweened(0, { easing: cubicOut });

	// Disable the "Cancel" button once a transaction has been initiated
	$: wizard.toggleComplete('meta:no-return', transactionId !== undefined);

	async function authorizeTransfer() {
		const tokenInfo = await fetchTokenInfo(denominationToken.address);
		const value = parseUnits(paymentValue, tokenInfo.decimals);

		return getSignedArguments(
			'TransferWithAuthorization',
			$wizard.data.chainId,
			tokenInfo,
			$wallet.address!,
			contracts.payment_forwarder,
			value
		);
	}

	async function confirmPayment(signedArgs: SignedArguments) {
		const { request } = await prepareWriteContract({
			address: contracts.payment_forwarder,
			abi: paymentForwarderABI,
			functionName: 'buySharesOnBehalfUsingTransferWithAuthorization',
			args: [...signedArgs, 1]
		});

		return writeContract(request);
	}

	const payment = fsm('initial', {
		initial: {
			// restore state on wizard back/next navigation
			restore(state) {
				({ errorMessage, transactionId, paymentValue } = $wizard.data);
				if (state === 'authorizing' || state === 'confirming') {
					errorMessage = `Wallet request state lost due to window navigation;
						please cancel wallet request and try again.`;
					return 'failed';
				}
				return state;
			},

			authorize() {
				authorizeTransfer().then(payment.confirm).catch(payment.fail);
				return 'authorizing';
			}
		},

		authorizing: {
			confirm(signedArgs) {
				confirmPayment(signedArgs).then(payment.process).catch(payment.fail);
				return 'confirming';
			},

			fail(err) {
				console.error('authorizeTransfer error:', err);
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

		confirming: {
			process({ hash }) {
				transactionId = hash;
				wizard.updateData({ transactionId });
				return 'processing';
			},

			fail(err) {
				console.error('confirmPayment error:', err);
				errorMessage = 'Payment confirmation from wallet account failed. ';
				errorMessage += err.shortMessage ?? 'Failure reason unknown.';
				return 'failed';
			}
		},

		processing: {
			_enter({ event }) {
				const hash = transactionId!;
				let duration = 20_000;

				if (event === 'restore') {
					// try fetching receipt in case transaction already completed
					getPublicClient()
						.getTransactionReceipt({ hash })
						.then(payment.finish)
						.catch(() => {});
					progressBar.set(50, { duration: 0 });
					duration *= 0.5;
				}

				// wait for pending transaction
				waitForTransaction({ hash }).then(payment.finish).catch(payment.fail);
				progressBar.set(100, { duration });
			},

			_exit() {
				progressBar.set(100, { duration: 100 });
			},

			finish(receipt) {
				if (receipt.status !== 'success') {
					console.error('waitForTransaction reverted:', receipt);
					errorMessage = 'Transaction execution reverted. See blockchain explorer for details.';
					return 'failed';
				}
				return 'completed';
			},

			fail(err) {
				console.error('waitForTransaction error:', err);
				if (err.name === 'CallExecutionError') {
					errorMessage = `${err.shortMessage} See blockchain explorer for details.`;
				} else {
					errorMessage = 'Unable to verify transaction status. See blockchain explorer for details.';
				}
				return 'failed';
			}
		},

		failed: {
			_enter() {
				wizard.updateData({ errorMessage });
			},

			retry() {
				return transactionId ? 'processing' : 'initial';
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

	payment.restore($wizard.data.paymentState);
	$: wizard.updateData({ paymentState: $payment });
</script>

<div class="wallet-deposit">
	<section>
		<h3>Your current balance</h3>

		<WalletInfo alignValues="right">
			<WalletInfoItem>
				<EntitySymbol
					slot="label"
					type="token"
					label={nativeCurrency.symbol}
					slug={nativeCurrency.symbol.toLowerCase()}
				/>
				{formatNumber(Number(nativeCurrency.formatted), 2, 4)}
			</WalletInfoItem>

			<WalletInfoItem>
				<EntitySymbol
					slot="label"
					type="token"
					label={denominationToken.symbol}
					slug={denominationToken.symbol.toLowerCase()}
				/>
				{formatNumber(Number(denominationToken.formatted), 2, 4)}
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
				on:click={() => (paymentValue = denominationToken.formatted)}
				disabled={paymentValue === denominationToken.formatted}
			>
				Deposit all
				<span class="wide">{denominationToken.symbol}</span>
			</Button>
		</header>

		<form class="payment-form" on:submit|preventDefault={payment.authorize}>
			<MoneyInput
				bind:this={paymentInput}
				bind:value={paymentValue}
				size="xl"
				tokenUnit={denominationToken.symbol}
				disabled={$payment !== 'initial'}
				min={formatUnits(1n, denominationToken.decimals)}
				max={denominationToken.formatted}
				on:change={() => wizard.updateData({ paymentValue })}
			/>

			{#if $payment === 'initial'}
				<Button submit disabled={!paymentValue}>Make payment</Button>

				<Alert size="sm" status="warning" title="Notice">
					Investing in crypto trading carries significant risks. Past performance is not indicative of future results.
					Only invest funds you are willing to lose.
				</Alert>
			{/if}

			{#if $payment === 'authorizing'}
				<Alert size="sm" status="warning" title="Authorize transfer">
					Please authorize the transfer of {denominationToken.symbol} tokens from your wallet account.
				</Alert>
			{/if}

			{#if $payment === 'confirming'}
				<Alert size="sm" status="warning" title="Confirm transaction">
					Please confirm the transaction in your wallet in order submit your payment.
				</Alert>
			{/if}

			{#if transactionId}
				<div class="transaction-id">
					<h3>Transaction ID</h3>
					<CryptoAddressWidget address={transactionId} href={getExplorerUrl($wallet.chain, transactionId)} />
				</div>

				<progress max="100" value={$progressBar} />
			{/if}

			{#if $payment === 'processing'}
				<Alert size="sm" status="info" title="Payment processing">
					The duration of processing may vary based on factors such as blockchain congestion and gas specified. Click
					the transaction ID above to view the status in the blockchain explorer.
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

<style lang="postcss">
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
			color: hsla(var(--hsl-text-light));
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
