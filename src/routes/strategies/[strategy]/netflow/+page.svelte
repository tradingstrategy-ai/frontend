<!--
	Page to display netflow, total equity and such.
-->
<script lang="ts">
	import { min } from 'd3-array';
	import type { RawTick, Quote } from '$lib/chart';
	import type { TimeInterval } from 'd3-time';
	import { parseDate } from '$lib/helpers/date.js';
	import { ChartContainer, PerformanceChart, normalizeDataForInterval } from '$lib/chart';
	import { formatDaysAgo, formatDollar } from '$lib/helpers/formatters';
	import { getChartClient } from 'trade-executor/chart';

	export let data;
	const { strategy } = data;

	const startedAt = strategy.summary_statistics.key_metrics.started_at?.value;

	const tvlClient = getChartClient(fetch, strategy.url);
	tvlClient.fetch({ type: 'total_equity', source: 'live_trading' });

	const netflowClient = getChartClient(fetch, strategy.url);
	netflowClient.fetch({ type: 'netflow', source: 'live_trading' });

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

	// merge two Quote arrays
	function mergeData(data1: Quote[], data2: Quote[]) {
		const merged: Quote[] = [];
		while (data1.length || data2.length) {
			const nextDate = min([<Date>data1[0]?.DT, <Date>data2[0]?.DT])!;
			const quote: Quote = { DT: nextDate };
			if (nextDate.valueOf() === data1[0]?.DT.valueOf()) {
				Object.assign(quote, data1.shift());
			}
			if (nextDate.valueOf() === data2[0]?.DT.valueOf()) {
				Object.assign(quote, data2.shift());
			}
			merged.push(quote);
		}
		return merged;
	}
</script>

<svelte:head>
	<title>TVL and Netflow | {strategy.name} | Trading Strategy</title>
	<meta name="description" content="TVL and Netflow time-series charts for {strategy.name} strategy" />
</svelte:head>

<section class="tvl">
	<p>Displaying live trading metrics. This strategy has been live <strong>{formatDaysAgo(startedAt)}</strong>.</p>

	<ChartContainer title="Total value locked" showTimeSpans let:timeSpan={{ spanDays, interval, periodicity }}>
		<p slot="subtitle">
			Learn more about
			<a class="body-link" href="/glossary/total-equity" target="_blank">TVL</a> and
			<a class="body-link" href="/glossary/netflow" target="_blank">Netflow</a>
			metrics and how they're calculated.
		</p>
		<PerformanceChart
			loading={$tvlClient.loading}
			data={mergeData(
				normalizeDataForInterval($tvlClient.data ?? [], interval),
				summarizeNetflowData($netflowClient.data ?? [], interval)
			)}
			formatValue={formatDollar}
			{spanDays}
			{periodicity}
			studies={['Netflow']}
		/>
	</ChartContainer>
</section>

<style lang="postcss">
	.tvl {
		display: grid;
		gap: var(--space-lg);

		/* hide ChartIQ panel controls */
		:global(:is(.stx-ico-focus, .stx-ico-down, .stx-ico-up, .stx-ico-close)) {
			display: none;
		}

		:global(.stx-panel-study .stx-panel-title) {
			@media (--viewport-sm-up) {
				display: unset;
			}
		}
	}
</style>
