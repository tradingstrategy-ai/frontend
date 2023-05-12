<script lang="ts">
	import { AlertList, AlertItem, Button, SummaryBox, EntitySymbol } from '$lib/components';
	import DataBox from '$lib/components/DataBox.svelte';
	import Grid from '$lib/components/Grid.svelte';

	export let isWalletConnected = true;
</script>

<SummaryBox title="Deposit status">
	<div class="content">
		{#if !isWalletConnected}
			<AlertList status="warning" size="md">
				<AlertItem title="Wallet not connected">Please connect wallet to see your deposit status</AlertItem>
			</AlertList>
		{:else}
			<Grid cols={2} gap="lg">
				<DataBox>
					<svelte:fragment slot="label">Deposit status</svelte:fragment>
					<svelte:fragment>
						<EntitySymbol slug="usdc" type="token">1000.25 USDC</EntitySymbol>
					</svelte:fragment>
				</DataBox>
				<DataBox>
					<svelte:fragment slot="label">Strategy shares</svelte:fragment>
					<svelte:fragment>
						<EntitySymbol slug="uni" type="token">123.45 SHR</EntitySymbol>
					</svelte:fragment>
				</DataBox></Grid
			>
		{/if}
	</div>
	<!-- <div class="actions">
		<Button href="/wizard/deposit" label="Deposit" disabled={!isWalletConnected} />
		<Button href="/wizard/redeem" label="Redeem" disabled={!isWalletConnected} />
	</div> -->
</SummaryBox>

<style>
	.actions {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
		gap: var(--space-ml);
	}
</style>
