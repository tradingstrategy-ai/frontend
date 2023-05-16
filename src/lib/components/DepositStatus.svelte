<script lang="ts">
	import { AlertList, AlertItem, EntitySymbol } from '$lib/components';
	import DataBox from '$lib/components/DataBox.svelte';
	import Grid from '$lib/components/Grid.svelte';

	export let isWalletConnected = true;
</script>

<div class="content">
	{#if !isWalletConnected}
		<AlertList status="warning" size="md">
			<AlertItem title="Wallet not connected">Please connect wallet to see your deposit status</AlertItem>
		</AlertList>
	{:else}
		<Grid cols={2} gap="lg">
			<DataBox>
				<svelte:fragment slot="label">Number of shares</svelte:fragment>
				<svelte:fragment>
					<EntitySymbol slug="uni" type="token">123.45 SHR</EntitySymbol>
				</svelte:fragment>
			</DataBox>
			<DataBox>
				<svelte:fragment slot="label">Value of shares</svelte:fragment>
				<svelte:fragment>
					<EntitySymbol slug="usdc" type="token">1000.25 USDC</EntitySymbol>
				</svelte:fragment>
			</DataBox>
		</Grid>
	{/if}
</div>
