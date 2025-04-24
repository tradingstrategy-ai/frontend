<script lang="ts">
	import StrategyChart from '$lib/charts/StrategyChart.svelte';
	import type { TvChartOptions } from '$lib/charts/types';
	import { formatDollar } from '$lib/helpers/formatters';

	export let tvlData: [number, number][] | undefined;

	const options: TvChartOptions = {
		handleScroll: false,
		handleScale: false
	};

	function formatValue(value: number, min = 0, max = min || 1) {
		return formatDollar(value, min, max);
	}
</script>

<div class="strategy-tvl-chart">
	<StrategyChart title="Strategy TVL" data={tvlData} {options} {formatValue}>
		{#snippet subtitle()}
			<a class="body-link" target="_blank" href="/glossary/total-value-locked">Total value locked</a>
			in live strategies
		{/snippet}
	</StrategyChart>
</div>

<style>
	.strategy-tvl-chart {
		:global([data-css-props]) {
			--chart-aspect-ratio: 2.5;

			@media (--viewport-sm-down) {
				--chart-aspect-ratio: 2.25;
			}

			@media (--viewport-xs) {
				--chart-aspect-ratio: 2;
			}
		}
	}
</style>
