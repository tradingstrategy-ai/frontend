<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import Timestamp from '$lib/components/Timestamp.svelte';
	import TopVaultsTable from '$lib/top-vaults/TopVaultsTable.svelte';
	import { formatDollar } from '$lib/helpers/formatters';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';

	const { data } = $props();
	const { topVaults, chain } = data;

	const chainName = chain.chain_name;
</script>

<svelte:head>
	<title>{chainName} vaults | Trading Strategy</title>
	<meta name="description" content="Top vaults on {chainName} ranked by TVL." />
</svelte:head>

<Breadcrumbs labels={{ [chain.chain_slug]: chainName, vaults: 'Top Vaults' }} />

<main class="chain-vaults ds-3">
	{#if !topVaults.rows.length}
		<Section padding="sm">
			<p>No vault data available for {chainName}.</p>
		</Section>
	{:else}
		<Section padding="sm" class="vaults-table">
			<div class="page-header">
				<h1 class="chain-title">{chainName} vaults</h1>
				<p class="chain-subtitle">
					Updated <Timestamp date={topVaults.generated_at} relative />
				</p>
				<p class="chain-subtitle">
					Showing vaults currently tracked on {chainName}.
				</p>
			</div>

			<header class="table-header">
				<div class="totals">
					<span>Total chain TVL {formatDollar(topVaults.current_tvl_usd, 2, 2)}</span>
					<span>Peak chain TVL {formatDollar(topVaults.peak_tvl_usd, 2, 2)}</span>
					<span>Vaults listed {topVaults.rows.length}</span>
				</div>
			</header>

			<TopVaultsTable {topVaults} />
		</Section>
	{/if}
</main>

<style>
	.chain-vaults {
		display: grid;
		gap: 0.5rem;
		padding-bottom: 1rem;
	}

	.page-header {
		display: grid;
		gap: var(--space-xs);
		max-width: 70ch;
	}

	.chain-title {
		font-size: 1.9rem;
		font-weight: 600;
		color: var(--c-text);
		margin: 0;
	}

	.chain-subtitle {
		font-size: 1rem;
		color: var(--c-text-light);
		font-weight: 500;
		margin: 0;
	}

	.totals {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		margin-top: 1rem;
		color: var(--c-text-extra-light);
		font: var(--f-ui-sm-roman);
	}
</style>
