<script>
	import { Button, AlertItem, AlertList, SmartContractWidget } from '$lib/components';

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
	{#if status === 'start'}
		<p>What do we want to have here?</p>

		<Button on:click={() => (status = 'confirmation')}>Make payment</Button>
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
</div>

<style lang="postcss">
	.wizard-payment {
		display: grid;
		place-items: start;
		gap: var(--space-md);
	}

	h3 {
		font: var(--f-ui-lg-roman);
	}

	progress {
		justify-self: stretch;
	}
</style>
