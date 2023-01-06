<script lang="ts">
	import type { StrategyRuntimeState } from 'trade-executor-frontend/strategy/runtimeState';
	import StrategyTile from './StrategyTile.svelte';

	export let strategies: StrategyRuntimeState[];

	$: console.log(getMinMaxValues(strategies));
	$: console.log(getDateRange());

	function getMinMaxValues(strategies) {
		const allValues = strategies.flatMap(({ summary_statistics }) => {
			const ticks = summary_statistics?.performance_chart_90_days || [];
			return ticks.map((t) => t[1]);
		});

		return [Math.min(...allValues), Math.max(...allValues)];
	}

	function getDateRange() {
		const endDate = new Date();
		endDate.setUTCHours(0, 0, 0, 0);
		const startDate = new Date(endDate);
		startDate.setUTCDate(endDate.getUTCDate() - 89);
		return [startDate, endDate];
	}
</script>

<ul>
	{#each strategies as strategy (strategy.id)}
		<StrategyTile {strategy} />
	{/each}
</ul>

<style>
	ul {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(27.75rem, 90vw, var(--container-max-width)), 1fr));
		gap: var(--strategies-listing-gap, var(--space-xl));
		padding: 0;
	}
</style>
