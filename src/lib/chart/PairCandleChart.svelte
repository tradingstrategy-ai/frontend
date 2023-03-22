<!--
@component
Display trading pair candles (ohlc+v) charts, with attached quoteFeed for chart data.

#### Usage:
```tsx
	<PairCandleChart
		quoteFeed={quoteFeed}
		pairId={12345}
		exchangeType="uniswap_v2"
		firstTradeDate="2020-01-02T00:00"
		timeBucket="4h"
		studies={['Volume Underlay']}
		linker={chartLinker}
	>
		<div slot="hud-row-1">...</div>
		<div slot="hud-row-2">...</div>
	</PairCandleChart>
```
-->
<script lang="ts">
	import type { TimeBucket } from './timeBucketConverters';
	import type ChartLinker from './ChartLinker';
	import { timeBucketToPeriodicity } from './timeBucketConverters';
	import { formatDollar, formatPriceChange } from '$lib/helpers/formatters';
	import { ChartHudRow, ChartHudMetric } from '$lib/components';
	import ChartIQ from './ChartIQ.svelte';

	export let quoteFeed: any;
	export let pairId: number | string;
	export let exchangeType: string;
	export let firstTradeDate: string;
	export let timeBucket: TimeBucket;
	export let studies: any[] = [];
	export let linker: ChartLinker | undefined = undefined;

	$: periodicity = timeBucketToPeriodicity(timeBucket);

	let viewportWidth: number;
	$: hideYAxis = viewportWidth <= 576;

	function formatForHud(value: number) {
		return formatDollar(value, 3, 3, '');
	}

	const options = {
		layout: { crosshair: true },
		controls: { chartControls: null },
		dontRoll: true
	};

	const init = (chartEngine: any) => {
		// match the current price label precision to other yAxis labels
		chartEngine.addEventListener('symbolChange', () => {
			chartEngine.chart.yAxis.maxDecimalPlaces = chartEngine.chart.yAxis.printDecimalPlaces;
		});

		// HACK to address ChartIQ bug - times in floating x-axis label are off by 3h for 4h timeBucket
		const originalFormatter = chartEngine.chart.xAxis.formatter;
		chartEngine.chart.xAxis.formatter = function (labelDate: Date) {
			const adjustedDate = new Date(labelDate);
			if (timeBucket === '4h') {
				adjustedDate.setUTCHours(adjustedDate.getUTCHours() + 3);
			}
			return originalFormatter(adjustedDate);
		};

		// update the chart - used on both initial load and updates
		function update() {
			// hide the Y Axis on smaller screens
			chartEngine.chart.yAxis.position = hideYAxis ? 'none' : 'right';
			// make exchangeType and firstTradeDate available to the quoteFeed
			chartEngine.exchangeType = exchangeType;
			chartEngine.firstTradeDate = firstTradeDate;
			// load the chart
			chartEngine.loadChart(pairId, { periodicity });
		}

		return { update };
	};
</script>

<svelte:window bind:innerWidth={viewportWidth} />

<ChartIQ
	{init}
	{options}
	{studies}
	{linker}
	{quoteFeed}
	invalidate={[pairId, periodicity, hideYAxis, firstTradeDate, exchangeType]}
	let:activeTick
>
	{#if activeTick}
		{@const priceChangeAmt = activeTick.Close - activeTick.Open}
		{@const priceChangePct = priceChangeAmt / activeTick.Open}
		{@const direction = Math.sign(priceChangeAmt)}

		<ChartHudRow>
			<ChartHudMetric label="O" value={formatForHud(activeTick.Open)} {direction} />
			<ChartHudMetric label="H" value={formatForHud(activeTick.High)} {direction} />
			<ChartHudMetric label="L" value={formatForHud(activeTick.Low)} {direction} />
			<ChartHudMetric label="C" value={formatForHud(activeTick.Close)} {direction} />
			<ChartHudMetric value={formatForHud(priceChangeAmt)} {direction} />
			<ChartHudMetric value={formatPriceChange(priceChangePct)} {direction} />
		</ChartHudRow>

		<slot name="hud-row-volume" {activeTick} formatter={formatForHud} />
	{/if}
</ChartIQ>
