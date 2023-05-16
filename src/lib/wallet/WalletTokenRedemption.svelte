<script lang="ts">
	import DataBox from '$lib/components/DataBox.svelte';
	import DepositStatus from '$lib/components/DepositStatus.svelte';
	// import EntitySymbol from '$lib/components/EntitySymbol.svelte';
	// import MoneyInput from '$lib/components/MoneyInput.svelte';
	import fsm from 'svelte-fsm';
	import { tweened } from 'svelte/motion';
	import { Button, AlertItem, AlertList, CryptoAddressWidget, EntitySymbol, Grid, MoneyInput } from '$lib/components';

	let redemptionValue: number;

	const redemptionProgress = tweened(0, { duration: 2000 });

	const redemption = fsm('initial', {
		initial: {
			confirm: 'confirming'
		},
		confirming: {
			process: 'processing'
		},
		processing: {
			_enter() {
				redemptionProgress.set(100).then(redemption.finish);
			},
			finish: 'done'
		},
		done: {}
	});
</script>

<div class="wallet-token-redemption">
	<section>
		<h3>Your current balance</h3>

		<DataBox>
			<svelte:fragment slot="label">Number of shares</svelte:fragment>
			<svelte:fragment>
				<EntitySymbol label="SHR" slug="uni" type="token">123.45 SHR</EntitySymbol>
			</svelte:fragment>
		</DataBox>
	</section>

	<section>
		{#if $redemption === 'initial'}
			<h3>Enter amount of shares to redeem</h3>

			<form action="" class="redemption-form">
				<MoneyInput conversionRatio={10} showConversionLabel size="xl" tokenUnit="SHR" bind:value={redemptionValue} />

				<Button disabled={!redemptionValue} size="lg" on:click={redemption.confirm}>Redeem</Button>
			</form>
		{:else if $redemption === 'confirming'}
			<div
				class="confirmation"
				style="display: contents;"
				on:click={redemption.process}
				on:keydown={redemption.process}
			>
				<h3>Confirm transaction in your wallet.</h3>

				<AlertList size="sm" status="warning">
					<AlertItem>Open MetaMask browser extension to confirm the transaction .</AlertItem>
				</AlertList>
			</div>
		{:else if $redemption === 'processing'}
			<h3>Confirming transaction...</h3>
			<progress max="100" value={$redemptionProgress} />
			<p class="disclaimer">
				Ullamco esse adipisicing ut reprehenderit Lorem elit occaecat eiusmod tempor nulla aliquip.
			</p>
		{:else if $redemption === 'done'}
			<div class="transaction-id">
				<h3>Transaction ID</h3>
				<CryptoAddressWidget address="0x6C0836c82d629EF21b9192D88b043e65f4fD7237" href="#" />
			</div>
		{/if}
	</section>
</div>

<!-- <DataBox>
	<svelte:fragment slot="label">You have</svelte:fragment>
	<svelte:fragment>
		<EntitySymbol slug="uni" type="token">123.45 SHR</EntitySymbol>
	</svelte:fragment>
</DataBox> -->

<style>
	.wallet-token-redemption {
		display: grid;
		gap: var(--space-xl);

		& section {
			display: grid;
			gap: var(--space-ls);
		}

		& h3 {
			color: hsla(var(--hsl-text-light));
			font: var(--f-ui-lg-medium);
		}
	}

	.redemption-form {
		display: grid;
		gap: var(--space-xl);
	}

	.transaction-id {
		display: grid;
		gap: var(--space-ss);
	}
</style>
