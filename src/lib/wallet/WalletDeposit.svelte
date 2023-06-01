<script lang="ts">
	import fsm from 'svelte-fsm';
	import { tweened } from 'svelte/motion';
	import { prepareWriteContract, writeContract } from '@wagmi/core';
	import { parseUnits } from 'viem';
	import { wallet } from './client';
	import { getUsdcAddress } from './utils';
	import { fetchTokenInfo, getSignedArguments } from '$lib/eth-defi/eip-3009';
	import paymentForwarderABI from '$lib/eth-defi/abi/VaultUSDCPaymentForwarder.json';
	import { Button, AlertItem, AlertList, CryptoAddressWidget, EntitySymbol, MoneyInput } from '$lib/components';

	export let chainId: number;
	export let contracts: Contracts;

	let paymentValue: number;

	const paymentProgress = tweened(0, { duration: 2000 });

	async function submitPayment() {
		const tokenInfo = await fetchTokenInfo(getUsdcAddress(chainId));
		const value = parseUnits(`${paymentValue}`, tokenInfo.decimals);

		const signedArgs = await getSignedArguments(
			'TransferWithAuthorization',
			chainId,
			tokenInfo,
			$wallet.address,
			contracts.payment_forwarder,
			value
		);

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
			confirm() {
				submitPayment().then(this.process).catch(this.reject);
				return 'confirming';
			}
		},

		confirming: {
			process(result) {
				console.log('paymentForwarder result:', result);
				return 'processing';
			},

			reject(err) {
				console.error('REJECTED:', err);
				return 'rejected';
			}
		},

		processing: {
			_enter() {
				paymentProgress.set(100).then(payment.finish);
			},
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
					<td><EntitySymbol type="token" label="MATIC" slug="matic" /></td>
					<td>682.2362</td>
				</tr>
				<tr>
					<td><EntitySymbol type="token" label="USDC" slug="usdc" /></td>
					<td>1200.18</td>
				</tr>
			</tbody>
		</table>
	</section>

	<section>
		{#if $payment === 'initial'}
			<h3>Enter amount to pay</h3>

			<form action="" class="payment-form">
				<MoneyInput size="xl" tokenUnit="USDC" bind:value={paymentValue} />

				<AlertList size="sm" status="warning">
					<AlertItem>Some disclaimer about risk or sth else can go here.</AlertItem>
				</AlertList>
				<Button disabled={!paymentValue} on:click={payment.confirm}>Make payment</Button>
			</form>
		{:else if $payment === 'confirming'}
			<h3>Confirm transaction in your wallet.</h3>
			<AlertList size="sm" status="warning">
				<AlertItem>Open MetaMask browser extension to confirm the transaction .</AlertItem>
			</AlertList>
		{:else if $payment === 'processing'}
			<h3>Processing transaction...</h3>
			<progress max="100" value={$paymentProgress} />
			<p class="disclaimer">
				Ullamco esse adipisicing ut reprehenderit Lorem elit occaecat eiusmod tempor nulla aliquip.
			</p>
		{:else if $payment === 'done'}
			<div class="transaction-id">
				<h3>Transaction ID</h3>
				<CryptoAddressWidget address="0x6C0836c82d629EF21b9192D88b043e65f4fD7237" href="#" />
			</div>
		{:else if $payment === 'rejected'}
			<AlertList size="sm" status="error">
				<AlertItem>Transaction rejected in wallet.</AlertItem>
			</AlertList>
		{/if}
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
		}
	}
</style>
