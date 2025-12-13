<script lang="ts">
	import ChartContainer from '$lib/charts/ChartContainer.svelte';
	import AreaSeries from '$lib/charts/AreaSeries.svelte';
	import NetflowSeries from '$lib/charts/NetflowSeries.svelte';
	import SeriesLabel from '$lib/charts/SeriesLabel.svelte';
	import { formatDaysAgo, formatDollar } from '$lib/helpers/formatters';
	import { getChartClient } from 'trade-executor/client/chart';

	let { data } = $props();
	const { strategy } = data;

	const startedAt = strategy.summary_statistics.key_metrics.started_at?.value;

	const tvlClient = getChartClient(fetch, strategy.url);
	const netflowClient = getChartClient(fetch, strategy.url);

	$effect(() => {
		tvlClient.fetch({ type: 'total_equity', source: 'live_trading' });
		netflowClient.fetch({ type: 'netflow', source: 'live_trading' });
	});
</script>

<svelte:head>
	<title>TVL and Netflow | {strategy.name} | Trading Strategy</title>
	<meta name="description" content="TVL and Netflow time-series charts for {strategy.name} strategy" />
</svelte:head>

<section class="netflow-page">
	<p>Displaying live trading metrics. This strategy has been live <strong>{formatDaysAgo(startedAt)}</strong>.</p>

	<ChartContainer
		boxed
		title="Total value locked"
		loading={$tvlClient.loading || $netflowClient.loading}
		data={$tvlClient.data}
		formatValue={formatDollar}
	>
		{#snippet subtitle()}
			Learn more about
			<a class="body-link" href="/glossary/total-equity" target="_blank">TVL</a> and
			<a class="body-link" href="/glossary/netflow" target="_blank">Netflow</a>
			metrics and how they're calculated.
		{/snippet}

		{#snippet series({ data, direction, onVisibleDataChange, timeSpan, range })}
			<AreaSeries
				{data}
				{direction}
				{onVisibleDataChange}
				options={{ priceLineVisible: false, crosshairMarkerVisible: false }}
			/>

			{#if range}
				<NetflowSeries data={$netflowClient.data ?? []} interval={timeSpan.interval} paneIndex={1}>
					<SeriesLabel class="netflow-title">Netflow</SeriesLabel>
				</NetflowSeries>
			{/if}
		{/snippet}
	</ChartContainer>
</section>

<style>
	.netflow-page {
		display: grid;
		gap: var(--space-lg);

		:global(.netflow-title) {
			top: 0.5rem;
			left: var(--chart-container-padding);
			padding-inline: 0;
			font: var(--f-heading-xs-medium);
			letter-spacing: var(--ls-heading-sm, normal);
			color: var(--c-text);
		}
	}
</style>
