<script lang="ts">
	import { getChartClient } from 'trade-executor/client/chart';
	import StrategyChart from '$lib/charts/StrategyChart.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import SegmentedControl from '$lib/components/SegmentedControl.svelte';
	import LongShortTable from './LongShortTable.svelte';
	import { formatPercent } from '$lib/helpers/formatters';

	let { data } = $props();

	const { strategyState, strategy } = data;

	const dataSources = {
		'Live trading': { table: 'live_stats', chart: 'live_trading' },
		Backtesting: { table: 'backtested_stats', chart: 'backtest' }
	} as const;

	let selectedDataSource: keyof typeof dataSources = $state('Live trading');
	let dataSource = $derived(dataSources[selectedDataSource]);

	let tableData = $derived(strategyState.stats.long_short_metrics_latest?.[dataSource.table]);

	const chartClient = getChartClient(fetch, strategy.url);

	$effect(() => {
		chartClient.fetch({
			type: 'compounding_unrealised_trading_profitability_sampled',
			source: dataSource.chart
		});
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

	<StrategyChart
		title="Performance"
		loading={$chartClient.loading}
		data={$chartClient.data}
		formatValue={formatPercent}
	>
		{#snippet subtitle()}
			Compounded
			<a class="body-link" href="/glossary/profitability" target="_blank">profitability</a>
			based on {selectedDataSource.toLocaleLowerCase()} data
		{/snippet}
	</StrategyChart>

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
	}
</style>
