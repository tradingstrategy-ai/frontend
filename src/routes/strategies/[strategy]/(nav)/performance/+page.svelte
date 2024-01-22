<!--
	Page to display the strategy performance.
-->
<script lang="ts">
	import { getPortfolioLatestStats } from 'trade-executor/state/stats';
	import { getChartClient } from 'trade-executor/chart';
	import SummaryStatistics from './SummaryStatistics.svelte';
	import { ChartContainer, PerformanceChart, normalizeDataForInterval } from '$lib/chart';
	import { formatPercent } from '$lib/helpers/formatters';
	import LongShortTable from './LongShortTable.svelte';

	export let data;
	const { state, strategy } = data;

	const chartClient = getChartClient(fetch, strategy.url);

	chartClient.fetch({
		type: 'compounding_realised_profitability',
		source: 'live_trading'
	});

	// Old path - read stats from the state
	const oldLatestStats = getPortfolioLatestStats(state);
	// New path - use server precalculated stats
	const summaryStatistics = strategy.summary_statistics;
</script>

<section class="performance">
	<ChartContainer title="Performance" let:timeSpan={{ spanDays, interval, periodicity }}>
		<p slot="subtitle">
			Compounded
			<a class="body-link" href="/glossary/profitability" target="_blank">profitability</a>
			of realised trading positions.
		</p>
		<PerformanceChart
			loading={$chartClient.loading}
			data={normalizeDataForInterval($chartClient.data ?? [], interval)}
			formatValue={formatPercent}
			{spanDays}
			{periodicity}
		/>
	</ChartContainer>

	{#if state.stats.long_short_metrics_latest}
		<LongShortTable tableData={state.stats.long_short_metrics_latest} />
	{:else}
		<SummaryStatistics {oldLatestStats} {summaryStatistics} />
	{/if}
</section>

<style>
	.performance {
		display: grid;
		gap: var(--space-lg);
	}
</style>
