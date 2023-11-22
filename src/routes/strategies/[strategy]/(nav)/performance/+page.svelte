<!--
	Page to display the strategy performance.
-->
<script lang="ts">
	import { getPortfolioLatestStats } from 'trade-executor/state/stats';
	import SummaryStatistics from './SummaryStatistics.svelte';
	import { ChartContainer, PerformanceChart, normalzeDataForInterval } from '$lib/chart';
	import { formatPercent } from '$lib/helpers/formatters';

	export let data;
	$: ({ state, summary, profitabilityChart } = data);

	// Old path - read stats from the state
	$: oldLatestStats = getPortfolioLatestStats(state);
	// New path - use server precalculated stats
	$: summaryStatistics = summary?.summary_statistics;
</script>

<section class="performance">
	{#if profitabilityChart}
		<ChartContainer title="Performance" let:timeSpan={{ spanDays, interval, periodicity }}>
			<p slot="subtitle">
				Compounded
				<a class="body-link" href={profitabilityChart.help_link}>profitability</a>
				of realised trading positions.
			</p>
			<PerformanceChart
				yAxis
				data={normalzeDataForInterval(profitabilityChart.data, interval)}
				formatValue={formatPercent}
				{spanDays}
				{periodicity}
			/>
		</ChartContainer>
	{/if}

	<SummaryStatistics {oldLatestStats} {summaryStatistics} />
</section>

<style>
	.performance {
		display: grid;
		gap: var(--space-lg);
	}
</style>
