<script lang="ts">
	import fsm from 'svelte-fsm';
	import { tweened } from 'svelte/motion';
	import { Button, AlertItem, AlertList, CryptoAddressWidget, EntitySymbol, MoneyInput } from '$lib/components';

	let paymentValue: number;

	const paymentProgress = tweened(0, { duration: 2000 });

	const payment = fsm('initial', {
		initial: {
			confirm: 'confirming'
		},
		confirming: {
			process: 'processing'
		},
		processing: {
			_enter() {
				paymentProgress.set(100).then(payment.finish);
			},
			finish: 'done'
		},
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
				<MoneyInput
					currentBalance={1200.18}
					label="Amount to deposit"
					size="xl"
					fiatUnit="$"
					tokenUnit="USDC"
					bind:value={paymentValue}
				/>

				<AlertList size="sm" status="warning">
					<AlertItem>Some disclaimer about risk or sth else can go here.</AlertItem>
				</AlertList>
				<Button disabled={!paymentValue} on:click={payment.confirm}>Make payment</Button>
			</form>
		{:else if $payment === 'confirming'}
			<div class="confirmation" style="display: contents;" on:click={payment.process} on:keydown={payment.process}>
				<h3>Confirm transaction in your wallet.</h3>

				<AlertList size="sm" status="warning">
					<AlertItem>Open MetaMask browser extension to confirm the transaction .</AlertItem>
				</AlertList>
			</div>
		{:else if $payment === 'processing'}
			<h3>Confirming transaction...</h3>
			<progress max="100" value={$paymentProgress} />
			<p class="disclaimer">
				Ullamco esse adipisicing ut reprehenderit Lorem elit occaecat eiusmod tempor nulla aliquip.
			</p>
		{:else if $payment === 'done'}
			<div class="transaction-id">
				<h3>Transaction ID</h3>
				<CryptoAddressWidget address="0x6C0836c82d629EF21b9192D88b043e65f4fD7237" href="#" />
			</div>
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
