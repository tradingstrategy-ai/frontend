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
	import { determinePriceChangeClass } from '$lib/helpers/price';
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
	$: showYAxis = viewportWidth >= 576;

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

		// update the chart - used on both initial load and updates
		function update() {
			// hide the Y Axis on smaller screens
			chartEngine.chart.yAxis.position = showYAxis ? 'right' : 'none';
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
	invalidate={[pairId, periodicity, showYAxis, firstTradeDate, exchangeType]}
	let:activeTick
>
	{#if activeTick}
		{@const priceChangeAmt = activeTick.Close - activeTick.Open}
		{@const priceChangePct = priceChangeAmt / activeTick.Open}

		<div class="hud">
			<slot name="hud-row-1" {activeTick} {formatForHud}>
				<div class="hud-row {determinePriceChangeClass(priceChangeAmt)}">
					<dl>
						<dt>O</dt>
						<dd>{formatForHud(activeTick.Open)}</dd>
					</dl>
					<dl>
						<dt>H</dt>
						<dd>{formatForHud(activeTick.High)}</dd>
					</dl>
					<dl>
						<dt>L</dt>
						<dd>{formatForHud(activeTick.Low)}</dd>
					</dl>
					<dl>
						<dt>C</dt>
						<dd>{formatForHud(activeTick.Close)}</dd>
					</dl>
					<dl><dd>{formatForHud(priceChangeAmt)}</dd></dl>
					<dl><dd>{formatPriceChange(priceChangePct)}</dd></dl>
				</div>
			</slot>
			<slot name="hud-row-2" {activeTick} {formatForHud}>
				<div class="hud-row">
					<dl>
						<dt>Vol</dt>
						<dd>{formatForHud(activeTick.Volume)}</dd>
					</dl>
				</div>
			</slot>
		</div>
	{/if}
</ChartIQ>

<style lang="postcss">
	.hud :global {
		position: absolute;
		top: 4px;
		left: 0;
		font: var(--f-ui-xsmall-roman);
		letter-spacing: 0.02em;

		& .hud-row {
			display: flex;
			gap: 0.5em;
		}

		& dl {
			display: flex;
			gap: var(--space-xxs);
			align-items: center;
			margin: 0;
		}

		& dt {
			color: var(--c-text-3-v1);
			font-weight: inherit;
		}

		& dd {
			margin: 0;
		}
	}
</style>
