<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import Timestamp from '$lib/components/Timestamp.svelte';
	import TopVaultsTable from '$lib/top-vaults/TopVaultsTable.svelte';
	import { formatDollar } from '$lib/helpers/formatters';

	const { data } = $props();
	const { topVaults } = data;
</script>

<svelte:head>
	<title>Top vaults | Trading Strategy</title>
	<meta name="description" content="Browse the highest performing vaults across all supported blockchains." />
</svelte:head>

<main class="top-vaults ds-3">
	{#if !topVaults.rows.length}
		<Section padding="sm">
			<p>No vault data available.</p>
		</Section>
	{:else}
		<Section padding="sm" class="vaults-table">
			<div class="page-header">
				<h1 class="page-title">The best-performing vaults on each chain</h1>
				<p class="page-subtitle">Minimum $50k USD TVL</p>
				<p class="page-subtitle">
					Updated <Timestamp date={topVaults.generated_at} relative />
				</p>
			</div>

			<header class="table-header">
				<div class="totals">
					<span>Total current TVL {formatDollar(topVaults.current_tvl_usd, 2, 2)}</span>
					<span>Peak TVL {formatDollar(topVaults.peak_tvl_usd, 2, 2)}</span>
					<span>Total vaults {topVaults.rows.length}</span>
				</div>
			</header>

			<TopVaultsTable {topVaults} />
		</Section>
	{/if}
</main>

<style>
	.top-vaults {
		display: grid;
		gap: 0.5rem;
		padding-bottom: 1rem;
	}

	.page-header {
		display: grid;
		gap: var(--space-xs);
		max-width: 70ch;
	}

	.page-title {
		font-size: 1.9rem;
		font-weight: 600;
		color: var(--c-text);
		margin: 0;
	}

	.page-subtitle {
		font-size: 1rem;
		color: var(--c-text-light);
		font-weight: 500;
		margin: 0;
	}

	.vaults-table {
		display: grid;
		gap: 1.5rem;
	}

	.table-header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		flex-wrap: wrap;
		gap: var(--space-sm);
	}

	.totals {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-md);
		color: var(--c-text-extra-light);
		font: var(--f-ui-sm-roman);
		margin-top: 1rem;
	}
</style>
