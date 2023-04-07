<script>
	import { Button, AlertItem, AlertList, EntitySymbol, SmartContractWidget, MoneyInput } from '$lib/components';

	export let paymentProgress = 0;

	$: status = 'start';

	$: if (status === 'processing' && paymentProgress < 1000) {
		setTimeout(() => paymentProgress++, 0);
	}
</script>

<div class="wizard-payment">
	<header>
		<h2>Payment</h2>
	</header>

	<section>
		<h3>Your current balance</h3>

		<table>
			<tbody>
				<tr>
					<td><EntitySymbol name="USDC" type="token" /></td>
					<td>20.01242</td>
				</tr>
				<tr>
					<td>ETH</td>
					<td>1.2 ETH</td>
				</tr>
			</tbody>
		</table>
	</section>

	<section>
		{#if status === 'start'}
			<h3>Enter amount to pay</h3>

			<form action="" class="payment-form">
				<div class="inner">
					<MoneyInput
						currentBalance={20.01241512}
						label="Amount to deposit"
						size="xl"
						fiatUnit="$"
						tokenUnit="USDC"
						maxAmount={20}
					/>
				</div>

				<AlertList size="sm" status="warning">
					<AlertItem>Some disclaimer about risk or sth else can go here.</AlertItem>
				</AlertList>
				<Button on:click={() => (status = 'confirmation')}>Make payment</Button>
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
	:is(.wizard-payment, .payment-form, .payment-form .inner) {
		display: grid;
		gap: var(--space-xl);
	}

	section {
		display: grid;
		gap: var(--space-md);
	}

	h3 {
		color: hsla(var(--hsl-text-light));
		font: var(--f-ui-lg-medium);
	}

	progress {
		justify-self: stretch;
	}

	.payment-form {
		gap: var(--space-xl) !important;
		place-items: start;
		& .inner {
			place-items: start;
		}

		& :global .alert-list {
			justify-self: stretch;
		}
	}
</style>
