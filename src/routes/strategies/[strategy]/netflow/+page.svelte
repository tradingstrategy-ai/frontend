<script lang="ts">
	import type { TvChartOptions } from '$lib/charts/types.js';
	import StrategyChart from '$lib/charts/StrategyChart.svelte';
	import NetflowSeries from '$lib/charts/NetflowSeries.svelte';
	import { formatDaysAgo, formatDollar } from '$lib/helpers/formatters';
	import { getChartClient } from 'trade-executor/client/chart';

	export let data;
	const { strategy } = data;

	const startedAt = strategy.summary_statistics.key_metrics.started_at?.value;

	const tvlClient = getChartClient(fetch, strategy.url);
	tvlClient.fetch({ type: 'total_equity', source: 'live_trading' });

	const netflowClient = getChartClient(fetch, strategy.url);
	netflowClient.fetch({ type: 'netflow', source: 'live_trading' });

	const options: TvChartOptions = {
		localization: { priceFormatter: formatDollar }
	};
</script>

<svelte:head>
	<title>TVL and Netflow | {strategy.name} | Trading Strategy</title>
	<meta name="description" content="TVL and Netflow time-series charts for {strategy.name} strategy" />
</svelte:head>

<section class="tvl">
	<p>Displaying live trading metrics. This strategy has been live <strong>{formatDaysAgo(startedAt)}</strong>.</p>

	<StrategyChart
		title="Total value locked"
		loading={$tvlClient.loading || $netflowClient.loading}
		data={$tvlClient.data}
		{options}
	>
		{#snippet subtitle()}
			Learn more about
			<a class="body-link" href="/glossary/total-equity" target="_blank">TVL</a> and
			<a class="body-link" href="/glossary/netflow" target="_blank">Netflow</a>
			metrics and how they're calculated.
		{/snippet}

		{#snippet series(_, timeSpan)}
			<NetflowSeries data={$netflowClient.data ?? []} interval={timeSpan.interval} paneIndex={1} />
		{/snippet}
	</StrategyChart>
</section>

<style>
	.tvl {
		display: grid;
		gap: var(--space-lg);
	}
</style>
