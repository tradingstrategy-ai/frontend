<script lang="ts">
	import { AlertList, AlertItem, Button, SummaryBox, EntitySymbol } from '$lib/components';
	import DataBox from '$lib/components/DataBox.svelte';
	import Grid from '$lib/components/Grid.svelte';

	export let walletIsConnected = true;
</script>

<SummaryBox title="Deposit status">
	<div class="content">
		{#if !walletIsConnected}
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
	<div class="actions">
		<!-- {#if walletIsConnected}
			<Button href="/wizard/deposit/introduction">Deposit</Button>
			<Button href="/wizard/redeem/introduction">Redeem</Button>
		{:else}
			<Button href="/wizard/connect-wallet/introduction">Connect wallet</Button>
		{/if} -->
		<Button href="/wizard/connect-wallet/introduction">{walletIsConnected ? 'Change wallet' : 'Connect wallet'}</Button>
		<Button href="/wizard/deposit/introduction">Deposit</Button>
		<Button href="/wizard/redeem/introduction">Redeem</Button>
	</div>
</SummaryBox>

<style>
	span {
		display: flex;
		gap: var(--space-sm);
	}
</style>
