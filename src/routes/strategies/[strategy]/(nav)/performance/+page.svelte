<!--
	Page to display the strategy performance.
-->
<script lang="ts">
	import type { LongShortMetrics } from 'trade-executor/state/statistics';
	import { getPortfolioLatestStats } from 'trade-executor/state/stats';
	import { getChartClient } from 'trade-executor/chart';
	import { ChartContainer, PerformanceChart, normalizeDataForInterval } from '$lib/chart';
	import { SegmentedControl } from '$lib/components';
	import SummaryStatistics from './SummaryStatistics.svelte';
	import LongShortTable from './LongShortTable.svelte';
	import { formatPercent } from '$lib/helpers/formatters';

	export let data;
	const { state, strategy } = data;

	const longShortMetrics = state.stats.long_short_metrics_latest;

	const dataSourceOptions = ['Live trading', 'Backtesting'] as const;
	type DataSource = (typeof dataSourceOptions)[number];
	let selectedDataSource: DataSource = 'Live trading';

	function getTableData(metrics: LongShortMetrics, source: DataSource) {
		// TODO: remove compatibility layer when all trade-executors have new schema
		if (!('live_stats' in metrics)) return metrics;

		const key = source === 'Live trading' ? 'live_stats' : 'backtested_stats';
		return metrics[key];
	}

	const chartClient = getChartClient(fetch, strategy.url);

	$: chartClient.fetch({
		type: 'compounding_realised_profitability',
		source: selectedDataSource === 'Live trading' ? 'live_trading' : 'backtest'
	});
</script>

<section class="performance-page">
	<div class="data-source">
		<SegmentedControl options={dataSourceOptions} bind:selected={selectedDataSource} />
		<p>
			Viewing performance based on
			<strong>{selectedDataSource.toLocaleLowerCase()}</strong>
			data
		</p>
	</div>

	<ChartContainer title="Performance" let:timeSpan={{ spanDays, interval, periodicity }}>
		<p slot="subtitle" class="chart-subtitle">
			Compounded
			<a class="body-link" href="/glossary/profitability" target="_blank">profitability</a>
			based on {selectedDataSource.toLocaleLowerCase()} data
		</p>
		<PerformanceChart
			loading={$chartClient.loading}
			data={normalizeDataForInterval($chartClient.data ?? [], interval)}
			formatValue={formatPercent}
			{spanDays}
			{periodicity}
		/>
	</ChartContainer>

	{#if longShortMetrics}
		<LongShortTable tableData={getTableData(longShortMetrics, selectedDataSource)} />
	{:else}
		<SummaryStatistics
			oldLatestStats={getPortfolioLatestStats(state)}
			summaryStatistics={strategy.summary_statistics}
		/>
	{/if}
</section>

<style>
	.performance-page {
		display: grid;
		gap: var(--space-lg);

		.data-source {
			display: flex;
			flex-wrap: wrap;
			gap: 1rem;
			align-items: center;
			justify-content: space-between;
		}

		.chart-subtitle {
			color: hsl(var(--hsl-text-extra-light));
			font: var(--f-ui-md-medium);
			letter-spacing: var(--ls-ui-md, normal);
		}
	}
</style>
