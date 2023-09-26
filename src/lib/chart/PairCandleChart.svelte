<!--
@component
Display trading pair candles (ohlc+v) charts, with attached quoteFeed for chart data.

#### Usage:
```tsx
	<PairCandleChart
		feed={quoteFeed(…)}
		pairId={12345}
		pairSymbol="ETH-USDC"
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
	import type { ChartLinker, QuoteFeed, TimeBucket } from '$lib/chart';
	import { timeBucketToPeriodicity, ChartIQ, HudRow, HudMetric } from '$lib/chart';
	import { Alert } from '$lib/components';
	import { formatDollar, formatPriceChange } from '$lib/helpers/formatters';

	export let feed: QuoteFeed;
	export let pairId: number | string;
	export let pairSymbol: string;
	export let exchangeType: string;
	export let firstTradeDate: MaybeString;
	export let timeBucket: TimeBucket;
	export let studies: any[] = [];
	export let linker: ChartLinker | undefined = undefined;

	$: periodicity = timeBucketToPeriodicity(timeBucket);

	let viewportWidth: number;
	$: hideYAxis = viewportWidth <= 576;

	// assume chart has data until we determine otherwise (see `loadChart` below)
	let hasData = true;

	function formatForHud(value: number) {
		return formatDollar(value, 3, 3, false);
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
			// pass required data to quoteFeed
			const symbol = {
				symbol: pairSymbol,
				urlParams: { pair_id: pairId, exchange_type: exchangeType, time_bucket: timeBucket },
				firstQuoteDate: firstTradeDate && new Date(firstTradeDate)
			};
			// load the chart
			chartEngine.loadChart(symbol, { periodicity }, () => {
				hasData = Boolean(chartEngine.chart.masterData.length);
			});
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
	{feed}
	invalidate={[pairId, periodicity, hideYAxis, firstTradeDate, exchangeType]}
	let:cursor
>
	{#if cursor.data}
		{@const priceChangeAmt = cursor.data.Close - cursor.data.Open}
		{@const priceChangePct = priceChangeAmt / cursor.data.Open}
		{@const direction = Math.sign(priceChangeAmt)}

		<div class="pair-candle-chart-hud">
			<HudRow>
				<HudMetric label="O" value={formatForHud(cursor.data.Open)} {direction} />
				<HudMetric label="H" value={formatForHud(cursor.data.High)} {direction} />
				<HudMetric label="L" value={formatForHud(cursor.data.Low)} {direction} />
				<HudMetric label="C" value={formatForHud(cursor.data.Close)} {direction} />
				<HudMetric value={formatForHud(priceChangeAmt)} {direction} />
				<HudMetric value={formatPriceChange(priceChangePct)} {direction} />
			</HudRow>

			<slot name="hud-row-volume" {cursor} formatter={formatForHud} />
		</div>
	{/if}

	{#if !hasData}
		<div class="no-chart-data">
			<Alert size="md" status="warning" title="No data available">
				No chart data available for <strong>{pairSymbol}</strong> at <strong>{timeBucket}</strong> time bucket. Try
				switching to a candle length of <strong>1d</strong> or greater.
			</Alert>
		</div>
	{/if}
</ChartIQ>

<style lang="postcss">
	.pair-candle-chart-hud {
		background: hsla(var(--hsla-box-3));
		display: inline-grid;
		gap: var(--space-ss);
		padding: var(--space-md);
	}

	.no-chart-data {
		max-width: min(65ch, 90vw);
		margin-top: 2rem;
		margin-inline: auto;

		@media (--viewport-sm-up) {
			padding-right: 3.75rem;
		}
	}
</style>
