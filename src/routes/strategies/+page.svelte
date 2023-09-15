<script lang="ts">
	import { min } from 'd3-array';
	import { fromUnixTime } from 'date-fns';
	import { PageHeading } from '$lib/components';
	import StrategyTile from './StrategyTile.svelte';

	export let data;
	$: ({ strategies, chainInfo } = data);

	function minPerformanceDate() {
		const timestamps = strategies.map(({ summary_statistics }) => {
			// return timestamp from first tick (each tick is tuple of [ ts, value ])
			const ticks = summary_statistics?.performance_chart_90_days;
			if (!ticks || ticks.length === 0) return;
			return ticks[0]?.[0];
		});
		return fromUnixTime(min(timestamps));
	}
</script>

<svelte:head>
	<title>Automated DeFi Strategies | Trading Strategy</title>
	<meta name="description" content="Browse currently available automated DeFi trading strategies" />
</svelte:head>

<main class="ds-container">
	<PageHeading>
		<h1>Strategies</h1>
		<p>Currently available strategies</p>
	</PageHeading>

	{#if strategies.length}
		<ul>
			{#each strategies as strategy (strategy.id)}
				<StrategyTile
					{strategy}
					chain={chainInfo[strategy.on_chain_data.chain_id]}
					chartStartDate={minPerformanceDate()}
				/>
			{/each}
		</ul>
	{:else}
		<p>No strategies configured</p>
	{/if}
</main>

<style>
	h1 {
		margin-top: var(--space-ls);
	}

	ul {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(27.75rem, 90vw, var(--container-max-width)), 1fr));
		gap: var(--strategies-listing-gap, var(--space-xl));
		padding: 0;
	}
</style>
