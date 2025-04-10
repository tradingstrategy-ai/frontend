<!--
@component
Displays trading pair price/volume and liquidity charts. The two charts are
linked so they scroll/zoom together and display crosshairs and HUD data
for the same hovered date. Also displays a time-bucket selector.

@example

```svelte
  <ChartSection
    pairId={12345}
    pairSymbol="ELON-ETH"
		exchangeType="uniswap_v2"
    firstTradeDate="2020-01-02T00:00"
  />
```
-->
<script lang="ts">
	import { type CandleTimeBucket, candleTimeBuckets } from '$lib/chart';
	import { type Candle, quoteFeed, candleToQuote } from '$lib/chart';
	import { ChartLinker, HudRow, HudMetric, PairCandleChart } from '$lib/chart';
	import Alert from '$lib/components/Alert.svelte';
	import SegmentedControl from '$lib/components/SegmentedControl.svelte';

	export let pairId: number | string;
	export let pairSymbol: string;
	export let exchangeType: string;
	export let firstTradeDate: string;
	export let hasTvlData = false;
	export let timeBucket: CandleTimeBucket;

	// NOTE: this is only used for special-case exception in quoteFeed
	// remove it once we have better support for base uniswap-v3 1d TVL chart data
	export let chainSlug: string;

	const chartLinker = new ChartLinker();

	function dataToQuotes(data: Record<string, Candle[]>) {
		const candles = data[pairId];
		return candles ? candles.map(candleToQuote) : [];
	}
</script>

<div class="chart-header">
	<h2>{pairSymbol} charts</h2>
	<slot />
	<SegmentedControl name="timeBucket" options={candleTimeBuckets} selected={timeBucket} on:change />
</div>

<div class="chart-wrapper">
	<h3>Price & volume</h3>
	<PairCandleChart
		{pairId}
		{pairSymbol}
		{exchangeType}
		{firstTradeDate}
		{timeBucket}
		feed={quoteFeed('candles', { candle_type: 'price' }, dataToQuotes)}
		studies={['Volume Underlay']}
		linker={chartLinker}
	>
		<HudRow slot="hud-row-volume" let:cursor let:formatter>
			<HudMetric label="Vol" value={formatter(cursor.data.Volume)} />
		</HudRow>
	</PairCandleChart>
</div>

<div class="chart-wrapper">
	<h3>TVL</h3>
	{#if hasTvlData}
		<PairCandleChart
			{pairId}
			{pairSymbol}
			{exchangeType}
			{firstTradeDate}
			{timeBucket}
			feed={quoteFeed('candles', { candle_type: 'tvl', chain_slug: chainSlug }, dataToQuotes)}
			linker={chartLinker}
		>
			<!-- NOTE: re-introduce vol added/removed when these metrics are available from backend for tvl -->
			<!--
			<HudRow slot="hud-row-volume" let:cursor let:formatter>
				<HudMetric label="Vol Added" value={formatter(cursor.data.av)} direction={1}>
					<span class="vol-added">{formatter(cursor.data.av)}</span>
				</HudMetric>
				<HudMetric label="Vol Removed" value={formatter(cursor.data.rv)} direction={-1} />
			</HudRow>
			-->
		</PairCandleChart>
	{:else}
		<div class="no-chart-data">
			<Alert size="md" status="warning" title="No data available">
				TVL chart data not currently available for <strong>{pairSymbol}</strong>
			</Alert>
		</div>
	{/if}
</div>

<style>
	.chart-header {
		:global([data-css-props]) {
			@media (--viewport-xs) {
				--segmented-control-font: var(--f-ui-xs-medium);
				--segmented-control-letter-spacing: var(--ls-ui-xs);
			}
		}

		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-sm) var(--space-lg);
		margin-bottom: 1em;

		h2 {
			flex: 1;
			font: var(--f-h2-medium);
			white-space: nowrap;
		}
	}

	.chart-wrapper {
		overflow: hidden;
	}

	h3 {
		border-bottom: 1px solid #999;
		font: var(--f-h5-medium);
		letter-spacing: 0.06em;
		text-transform: uppercase;

		@media (--viewport-xs) {
			font: var(--f-h6-medium);
		}
	}

	/* NOTE: re-introduce vol added/removed when these metrics are available from backend for tvl */
	/* .vol-added {
		display: inline-block;
		min-width: 4.5em;
	} */

	.no-chart-data {
		padding-block: 2rem;
		padding-inline: calc((100% - 70ch) / 2);
		border-bottom: 1px solid #999;
	}
</style>
