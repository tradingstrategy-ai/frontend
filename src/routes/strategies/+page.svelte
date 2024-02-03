<script lang="ts">
	import { PageHeading, PageHeader, SegmentedControl } from '$lib/components';
	import StrategyTile from './StrategyTile.svelte';

	export let data;
	$: ({ admin, strategies, chainInfo } = data);

	const options = ['all', 'live', 'unpublished'];
	let filter: (typeof options)[number] = 'all';

	$: filteredStrategies = strategies.filter((s) => {
		if (!admin || filter === 'all') return true;

		// return live strategies for "live" filter; others for "unpublished" filter
		const liveFilter = filter === 'live';
		const liveStrategy = s.connected && s.tags.includes('live');
		return liveFilter === liveStrategy;
	});
</script>

<svelte:head>
	<title>Automated DeFi Strategies | Trading Strategy</title>
	<meta name="description" content="Browse currently available automated DeFi trading strategies" />
</svelte:head>

<main class="ds-container strategies-index-page">
	<PageHeading title="Strategies" description="Currently available strategies">
		<svelte:fragment slot="cta">
			{#if admin}
				<SegmentedControl bind:selected={filter} {options} />
			{/if}
		</svelte:fragment>
	</PageHeading>

	{#if filteredStrategies.length}
		<ul>
			{#each filteredStrategies as strategy (strategy.id)}
				<StrategyTile {strategy} chain={chainInfo[strategy.on_chain_data?.chain_id]} />
			{/each}
		</ul>
	{:else}
		<p>
			No {#if admin && filter !== 'all'}{filter}{/if}
			strategies configured
		</p>
	{/if}
</main>

<style>
	.strategies-index-page {
		margin-top: var(--space-ls);
	}

	ul {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(27.75rem, 90vw, var(--container-max-width)), 1fr));
		gap: var(--strategies-listing-gap, var(--space-xl));
		padding: 0;
	}
</style>
