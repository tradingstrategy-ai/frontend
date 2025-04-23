<script lang="ts">
	import type { RawTick, Quote } from '$lib/chart';
	import type { TimeInterval } from 'd3-time';
	import type { TvChartOptions } from '$lib/charts/types.js';
	import { parseDate } from '$lib/helpers/date';
	import StrategyChart from '$lib/charts/StrategyChart.svelte';
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

	// Sum netflow values within the same chart interval
	function summarizeNetflowData(data: RawTick[], interval: TimeInterval) {
		return data.reduce((acc, [ts, value]) => {
			const date = parseDate(ts);
			if (!date) return acc;
			const normalizedDate = interval.floor(date);
			const lastAddedDate = acc.at(-1)?.DT;
			if (normalizedDate.valueOf() !== lastAddedDate?.valueOf()) {
				acc.push({ DT: normalizedDate, av: 0, rv: 0 });
			}
			acc.at(-1)!.av += value! > 0 ? value : 0;
			acc.at(-1)!.rv += value! < 0 ? value : 0;
			return acc;
		}, [] as Quote[]);
	}
</script>

<svelte:head>
	<title>TVL and Netflow | {strategy.name} | Trading Strategy</title>
	<meta name="description" content="TVL and Netflow time-series charts for {strategy.name} strategy" />
</svelte:head>

<section class="tvl">
	<p>Displaying live trading metrics. This strategy has been live <strong>{formatDaysAgo(startedAt)}</strong>.</p>

	<StrategyChart title="Total value locked" loading={$tvlClient.loading} data={$tvlClient.data} {options}>
		{#snippet subtitle()}
			Learn more about
			<a class="body-link" href="/glossary/total-equity" target="_blank">TVL</a> and
			<a class="body-link" href="/glossary/netflow" target="_blank">Netflow</a>
			metrics and how they're calculated.
		{/snippet}
	</StrategyChart>
</section>

<style>
	.tvl {
		display: grid;
		gap: var(--space-lg);
	}
</style>
