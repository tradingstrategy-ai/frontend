<!--
	Page to display the strategy performance.
-->
<script lang="ts">
	import { getChartClient } from 'trade-executor/client/chart';
	import { ChartContainer, PerformanceChart, normalizeDataForInterval } from '$lib/chart';
	import { Alert, SegmentedControl } from '$lib/components';
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

	// svelte-ignore reactive_declaration_non_reactive_property
	$: tableData = state.stats.long_short_metrics_latest?.[dataSource.table];

	const chartClient = getChartClient(fetch, strategy.url);
	$: chartClient.fetch({
		type: 'compounding_unrealised_trading_profitability_sampled',
		source: dataSource.chart
	});
</script>

<svelte:head>
	<title>Performance | {strategy.name} | Trading Strategy</title>
	<meta name="description" content="Performance chart and summary metrics for {strategy.name} strategy" />
</svelte:head>

<section class="performance-page">
	<div class="data-source">
		<SegmentedControl options={Object.keys(dataSources)} bind:selected={selectedDataSource} />
		<p>
			Viewing performance based on
			<strong>{selectedDataSource.toLocaleLowerCase()}</strong>
			data
		</p>
	</div>

	<ChartContainer title="Performance" let:timeSpan={{ spanDays, interval }}>
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
		/>
	</ChartContainer>

	{#if tableData}
		<LongShortTable {tableData} />
	{:else}
		<Alert status="warning" size="md" title="Data unavailable">Performance metrics table data not available.</Alert>
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
			color: var(--c-text-extra-light);
			font: var(--f-ui-md-medium);
			letter-spacing: var(--ls-ui-md, normal);
		}
	}
</style>
