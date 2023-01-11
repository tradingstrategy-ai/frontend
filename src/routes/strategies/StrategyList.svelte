<script lang="ts">
	import type { StrategyRuntimeState } from 'trade-executor-frontend/strategy/runtimeState';
	import StrategyTile from './StrategyTile.svelte';
	import { getUTCDateRange } from '$lib/helpers/date';
	import { scaleLinear, scaleUtc } from 'd3-scale';

	export let strategies: StrategyRuntimeState[];

	const yMax = getMaxAbsPerformanceValue();
	const scaleX = scaleUtc(getUTCDateRange(new Date(), -90), [0, 450]);
	const scaleY = scaleLinear([-yMax, yMax], [285, 0]).nice();

	// Find the maximum absolute performance data value across all strategies
	function getMaxAbsPerformanceValue() {
		let max = 0;
		for (const { summary_statistics } of strategies) {
			for (const tick of summary_statistics?.performance_chart_90_days || []) {
				max = Math.max(max, Math.abs(tick[1]));
			}
		}
		return max;
	}
</script>

<ul>
	{#each strategies as strategy (strategy.id)}
		<StrategyTile {strategy} {scaleX} {scaleY} />
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
