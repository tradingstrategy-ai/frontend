<!--
	Page to display the strategy performance.
-->
<script lang="ts">
	import { getChartClient } from 'trade-executor/chart';
	import { ChartContainer, PerformanceChart, normalizeDataForInterval } from '$lib/chart';
	import { SegmentedControl } from '$lib/components';
	import LongShortTable from './LongShortTable.svelte';
	import { formatPercent } from '$lib/helpers/formatters';

	export let data;
	const { state, strategy } = data;

	const dataSources = {
		'Live trading': { table: 'live_stats', chart: 'live_trading' },
		Backtesting: { table: 'backtested_stats', chart: 'backtest' }
	} as const;

	let selectedDataSource: keyof typeof dataSources = 'Live trading';
	$: dataSource = dataSources[selectedDataSource];

	const chartClient = getChartClient(fetch, strategy.url);
	$: chartClient.fetch({
		type: 'compounding_realised_profitability',
		source: dataSource.chart
	});
</script>

<section class="performance-page">
	<div class="data-source">
		<SegmentedControl options={Object.keys(dataSources)} bind:selected={selectedDataSource} />
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

	<LongShortTable tableData={state.stats.long_short_metrics_latest[dataSource.table]} />
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
