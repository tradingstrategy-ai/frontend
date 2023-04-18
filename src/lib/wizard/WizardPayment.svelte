<script lang="ts">
	import { Button, AlertItem, AlertList, EntitySymbol, SmartContractWidget, MoneyInput } from '$lib/components';

	export let paymentProgress = 0;
	export let paymentValue: number | null = null;

	$: status = 'start';

	$: if (status === 'processing' && paymentProgress < 1000) {
		setTimeout(() => paymentProgress++, 0);
	}

	$: paymentValue = null;
</script>

<div class="wizard-payment">
	<header>
		<h2>Payment</h2>
	</header>

	<section>
		<h3>Your current balance</h3>

		<table class="responsive">
			<tbody>
				<tr>
					<td><EntitySymbol name="MATIC" size="1.5rem" type="token" /></td>
					<td>682.2362</td>
				</tr>
				<tr>
					<td><EntitySymbol name="USDC" size="1.5rem" type="token" /></td>
					<td>1200.18</td>
				</tr>
			</tbody>
		</table>
	</section>

	<section>
		{#if status === 'start'}
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
				<Button disabled={!paymentValue} on:click={() => (status = 'confirmation')}>Make payment</Button>
			</form>
		{:else if status === 'confirmation'}
			<div
				class="confirmation"
				style="display: contents;"
				on:click={() => (status = 'processing')}
				on:keydown={() => (status = 'processing')}
			>
				<h3>Confirm transaction in your wallet.</h3>

				<AlertList size="sm" status="warning">
					<AlertItem>Open MetaMask browser extension to confirm the transaction .</AlertItem>
				</AlertList>
			</div>
		{:else if status === 'processing'}
			<h3>Confirming transaction...</h3>
			<progress max="1000" value={paymentProgress}>
				{paymentProgress / 10}
			</progress>
			<p class="disclaimer">
				Ullamco esse adipisicing ut reprehenderit Lorem elit occaecat eiusmod tempor nulla aliquip.
			</p>
			<SmartContractWidget address="0x6C0836c82d629EF21b9192D88b043e65f4fD7237" href="#" label="Transaction ID" />
			<div class="transaction-id" />
		{/if}
	</section>
</div>

<style lang="postcss">
	section,
	.payment-form,
	.payment-form .inner {
		display: grid;
	}

	section {
		margin-bottom: var(--space-3xl);
		gap: var(--space-ls);
	}

	h3 {
		color: hsla(var(--hsl-text-light));
		font: var(--f-ui-lg-medium);
	}

	tr td:last-child {
		--cell-padding: 0 var(--space-md) 0 var(--space-xs);
		text-align: right;
	}

	progress {
		justify-self: stretch;
	}

	.payment-form {
		gap: var(--space-xl) !important;

		& :global .alert-list {
			justify-self: stretch;
		}
	}
</style>
