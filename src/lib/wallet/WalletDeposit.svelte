<script lang="ts">
	import type { Wizard } from 'wizard/store';
	import fsm from 'svelte-fsm';
	import { tweened } from 'svelte/motion';
	import { prepareWriteContract, writeContract } from '@wagmi/core';
	import { parseUnits } from 'viem';
	import { wallet } from './client';
	import { type EIP3009SignedArguments, fetchTokenInfo, getSignedArguments } from '$lib/eth-defi/eip-3009';
	import paymentForwarderABI from '$lib/eth-defi/abi/VaultUSDCPaymentForwarder.json';
	import { Button, AlertItem, AlertList, CryptoAddressWidget, EntitySymbol, MoneyInput } from '$lib/components';

	export let wizard: Wizard;

	$: ({ chainId, contracts, denominationToken, nativeBalance } = $wizard.data);

	let paymentValue: number;
	let transactionId: Address;

	const paymentProgress = tweened(0, { duration: 10000 });

	async function authorizeTransfer() {
		const tokenInfo = await fetchTokenInfo(denominationToken.address);
		const value = parseUnits(`${paymentValue}`, tokenInfo.decimals);

		return getSignedArguments(
			'TransferWithAuthorization',
			chainId,
			tokenInfo,
			$wallet.address,
			contracts.payment_forwarder,
			value
		);
	}

	async function confirmPayment(signedArgs: EIP3009SignedArguments) {
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
			authorize() {
				authorizeTransfer().then(payment.confirm).catch(payment.reject);
				return 'authorizing';
			}
		},

		authorizing: {
			confirm(signedArgs) {
				confirmPayment(signedArgs).then(payment.process).catch(payment.reject);
				return 'confirming';
			},

			reject(err) {
				console.error('authorization rejected:', err);
				return 'rejected';
			}
		},

		confirming: {
			process(result) {
				transactionId = result.hash;
				paymentProgress.set(100).then(payment.finish);
				return 'processing';
			},

			reject(err) {
				console.error('confirmation rejected:', err);
				return 'rejected';
			}
		},

		processing: {
			finish: 'done'
		},

		rejected: {},

		done: {}
	});
</script>

<div class="wallet-deposit">
	<section>
		<h3>Your current balance</h3>

		<table class="responsive">
			<tbody>
				<tr>
					<td>
						<EntitySymbol type="token" label={nativeBalance.symbol} slug={nativeBalance.symbol.toLowerCase()} />
					</td>
					<td>{nativeBalance.formatted}</td>
				</tr>
				<tr>
					<td>
						<EntitySymbol type="token" label={denominationToken.symbol} slug={denominationToken.symbol.toLowerCase()} />
					</td>
					<td>{denominationToken.formatted}</td>
				</tr>
			</tbody>
		</table>
	</section>

	<section>
		<h3>Enter amount to deposit</h3>
		<form class="payment-form" on:submit|preventDefault={payment.authorize}>
			<MoneyInput size="xl" tokenUnit="USDC" bind:value={paymentValue} />

			{#if $payment === 'initial'}
				<Button submit disabled={!paymentValue}>Make payment</Button>

				<AlertList size="sm" status="warning">
					<AlertItem title="Notice">
						Investing in crypto trading carries significant risks. Past performance is not indicative of future results.
						Only invest funds you are willing to lose.
					</AlertItem>
				</AlertList>
			{/if}

			{#if $payment === 'authorizing'}
				<AlertList size="sm" status="warning">
					<AlertItem title="Authorize transfer">
						Please authorize the transfer of {denominationToken.symbol} tokens from your account in your wallet.
					</AlertItem>
				</AlertList>
			{/if}

			{#if $payment === 'confirming'}
				<AlertList size="sm" status="warning">
					<AlertItem title="Confirm transaction">
						Please confirm the transaction in your wallet in order submit your payment.
					</AlertItem>
				</AlertList>
			{/if}

			{#if transactionId}
				<div class="transaction-id">
					<h3>Transaction ID</h3>
					<CryptoAddressWidget address={transactionId} href="#" />
				</div>

				<progress max="100" value={$paymentProgress} />
			{/if}

			{#if $payment === 'processing'}
				<AlertList size="sm" status="info">
					<AlertItem title="Payment processing">
						The duration of processing may vary based on factors such as blockchain congestion and gas specified. Click
						the transaction ID above to view the status in the blockchain explorer.
					</AlertItem>
				</AlertList>
			{/if}

			{#if $payment === 'rejected'}
				<!-- TODO: handle different types of errors / display wallet error message details -->
				<AlertList size="sm" status="error">
					<AlertItem title="Error">Transaction was rejected or failed to process successfully.</AlertItem>
				</AlertList>
			{/if}

			{#if $payment === 'done'}
				<AlertList size="sm" status="success">
					<AlertItem title="Payment completed">
						Your transaction completed successfully and the shares have been added to your wallet. Click "Next" below to
						review your share balance.
					</AlertItem>
				</AlertList>
			{/if}
		</form>
	</section>
</div>

<style lang="postcss">
	.wallet-deposit {
		display: grid;
		gap: var(--space-3xl);

		& section {
			display: grid;
			gap: var(--space-ls);
		}

		& h3 {
			color: hsla(var(--hsl-text-light));
			font: var(--f-ui-lg-medium);
		}

		& table {
			margin: 0;

			/* FIXME: remove `!important` */
			@media (--viewport-sm-up) {
				--table-font: var(--f-ui-lg-medium) !important;
			}

			& td {
				padding: var(--space-xs) var(--space-ml);
				align-content: center;

				&:first-child {
					font: var(--f-ui-md-medium);
				}

				&:last-child {
					--cell-padding: 0 var(--space-md) 0 var(--space-xs);
					text-align: right;
				}
			}
		}

		& .payment-form {
			display: grid;
			gap: var(--space-xl);
		}

		& progress {
			width: 100%;
		}

		& .transaction-id {
			display: grid;
			gap: var(--space-md);
			justify-content: start;
		}
	}
</style>
