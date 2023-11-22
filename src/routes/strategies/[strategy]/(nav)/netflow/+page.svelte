<!--
	Page to display netflow, total equity and such.
-->
<script lang="ts">
	import { min } from 'd3-array';
	import type { RawTick, Quote } from '$lib/chart';
	import type { TimeInterval } from 'd3-time';
	import { parseDate } from '$lib/helpers/date.js';
	import { ChartContainer, PerformanceChart, normalzeDataForInterval } from '$lib/chart';
	import { formatDaysAgo, formatDollar } from '$lib/helpers/formatters';

	export let data;
	$: ({ tvlChart, netflowChart, startedAt } = data);

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

<section class="tvl">
	<p>Displaying live trading metrics. This strategy has been live <strong>{formatDaysAgo(startedAt)}</strong>.</p>

	<ChartContainer title="Total value locked" let:timeSpan={{ spanDays, interval, periodicity }}>
		{@const tvlData = normalzeDataForInterval(tvlChart.data, interval)}
		{@const netflowData = summarizeNetflowData(netflowChart.data, interval)}

		<p slot="subtitle">
			Learn more about
			<a class="body-link" href={tvlChart.help_link}>TVL</a> and
			<a class="body-link" href={netflowChart.help_link}>Netflow</a>
			metrics and how they're calculated.
		</p>
		<PerformanceChart
			yAxis
			data={mergeData(tvlData, netflowData)}
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
			display: block;
			margin: 0;
			padding-inline: var(--chart-container-padding, 0);
			font: var(--f-heading-xs-medium);
			letter-spacing: var(--f-heading-xs-spacing, normal);
			text-transform: none;
			box-shadow: none;

			@media (--viewport-xs) {
				display: none;
			}
		}
	}
</style>
