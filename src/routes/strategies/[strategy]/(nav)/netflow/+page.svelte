<!--
	Page to display netflow, total equity and such.
-->
<script lang="ts">
	import type { RawTick, Quote } from '$lib/chart';
	import type { TimeInterval } from 'd3-time';
	import { parseDate } from '$lib/helpers/date.js';
	import { ChartContainer, PerformanceChart, normalzeDataForInterval } from '$lib/chart';
	import { formatDaysAgo, formatDollar } from '$lib/helpers/formatters';

	export let data;
	$: ({ tvlChart, netflowChart, startedAt } = data);

	function getSummarizedData(data: RawTick[], interval: TimeInterval) {
		return data.reduce((acc, [ts, value]) => {
			const date = parseDate(ts);
			if (!date) return acc;
			const normalizedDate = interval.floor(date);
			const lastAddedDate = acc.at(-1)?.DT;
			if (normalizedDate.valueOf() !== lastAddedDate?.valueOf()) {
				acc.push({ DT: normalizedDate, Open: 0, Close: 0 });
			}
			acc.at(-1)!.Close! += value ?? 0;
			return acc;
		}, [] as Quote[]);
	}

	function initForInterval(interval: TimeInterval, chartEngine: any) {
		chartEngine.xAxisAsFooter = false;
		chartEngine.displayPanelResize = false;

		const netflowPanel = chartEngine.createPanel('netflow', 'netflow', 150);

		chartEngine.append('draw', () => {
			const { chart } = chartEngine;
			const y = chartEngine.pixelFromPrice(0, netflowPanel);
			chartEngine.plotLine({
				x0: chartEngine.pixelFromDate(chart.dataSet[0].DT),
				x1: chartEngine.pixelFromDate(chart.dataSegment.at(-1).DT),
				y0: y,
				y1: y,
				color: 'gray',
				type: 'segemnt',
				opacity: 0.5
			});
		});

		return () => {
			chartEngine.addSeries('netflow', {
				renderer: 'Candles',
				panel: 'netflow',
				displayFloatingLabel: false,
				yAxis: { displayGridLines: false },
				data: getSummarizedData(netflowChart.data, interval)
			});
		};
	}
</script>

<section class="tvl">
	<p>Displaying live trading metrics. This strategy has been live <strong>{formatDaysAgo(startedAt)}</strong>.</p>

	<ChartContainer title="Total value locked" let:timeSpan={{ spanDays, interval, periodicity }}>
		<p slot="subtitle">
			Learn more about
			<a class="body-link" href={tvlChart.help_link}>Total value locked</a>
			metric and how it is calculated.
		</p>
		<PerformanceChart
			data={normalzeDataForInterval(tvlChart.data, interval)}
			formatValue={formatDollar}
			{spanDays}
			{periodicity}
			init={initForInterval.bind(null, interval)}
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

		:global(.stx_panel_border) {
			color: transparent;
		}
	}
</style>
