<script lang="ts">
	import Alert from '$lib/components/Alert.svelte';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import HeroBanner from '$lib/components/HeroBanner.svelte';
	import Section from '$lib/components/Section.svelte';
	import Timestamp from '$lib/components/Timestamp.svelte';
	import TopVaultsTable from '$lib/top-vaults/TopVaultsTable.svelte';
	import { formatDollar } from '$lib/helpers/formatters';

	const { data } = $props();
	const { topVaults, chain } = data;

	const chainName = chain.chain_name;
</script>

<svelte:head>
	<title>{chainName} top vaults | Trading Strategy</title>
	<meta name="description" content="Top vaults on {chainName} ranked by performance." />
</svelte:head>

<Breadcrumbs labels={{ [chain.chain_slug]: chainName, vaults: 'Top Vaults' }} />

<main class="chain-vaults ds-3">
	<Section tag="header">
		<HeroBanner
			title="Top {chainName} Vaults"
			subtitle="The best performing DeFi vaults on {chainName} with minimum $50k USD TVL"
		/>
	</Section>

	{#if topVaults.rows.length}
		<Section>
			<div class="totals">
				<span>Total current TVL {formatDollar(topVaults.current_tvl_usd, 2, 2)}</span>
				<span>Peak TVL {formatDollar(topVaults.peak_tvl_usd, 2, 2)}</span>
				<span>Total vaults {topVaults.rows.length}</span>
				<span>Updated <Timestamp date={topVaults.generated_at} relative /></span>
			</div>
		</Section>

		<Section --section-padding="1rem">
			<TopVaultsTable {topVaults} />
		</Section>
	{:else}
		<Section padding="sm">
			<Alert title="Error">No vault data available.</Alert>
		</Section>
	{/if}
</main>

<style>
	.totals {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		color: var(--c-text-extra-light);
		font: var(--f-ui-md-medium);
		margin-top: 1rem;
	}
</style>
