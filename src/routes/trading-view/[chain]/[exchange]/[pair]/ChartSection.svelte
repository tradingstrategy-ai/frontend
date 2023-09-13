<!--
@component
Displays trading pair price/volume and liquidity charts. The two charts are
linked so they scroll/zoom together and display crosshairs and HUD data
for the same hovered date. Also displays a time-bucket selector.

#### Usage:
```tsx
  <ChartSection
    pairId={12345}
    pairSymbol="ELON-ETH"
		exchangeType="uniswap_v2"
    firstTradeDate="2020-01-02T00:00"
  />
```
-->
<script lang="ts">
	import { page } from '$app/stores';
	import type { TimeBucket } from '$lib/chart';
	import { type Candle, quoteFeed, candleToQuote } from '$lib/chart';
	import { ChartLinker, HudRow, HudMetric, PairCandleChart, TimeBucketSelector } from '$lib/chart';
	import { Alert } from '$lib/components';

	export let pairId: number | string;
	export let pairSymbol: string;
	export let exchangeType: string;
	export let firstTradeDate: string;
	export let hasTvlData = false;

	const chartLinker = new ChartLinker();

	function dataToQuotes(data: Record<string, Candle[]>) {
		const candles = data[pairId];
		return candles ? candles.map(candleToQuote) : [];
	}

	$: timeBucket = ($page.url.hash.slice(1) || '4h') as TimeBucket;
</script>

<div class="chart-header">
	<h2>{pairSymbol} charts</h2>
	<TimeBucketSelector active={timeBucket} />
</div>

<div class="chart-wrapper">
	<div class="chart-title">
		<h3>Price & volume</h3>
		<div class="help">
			<span class="prefix">expressed as</span>
			<a class="body-link" target="_blank" href="/glossary/ohlcv">OHLCV candles</a>
		</div>
	</div>
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

{#if exchangeType === 'uniswap_v3'}
	<div class="chart-wrapper">
		<div class="chart-title">
			<h3>TVL</h3>
			<div class="help">
				<span class="prefix">expressed as</span>
				<a class="body-link" target="_blank" href="/glossary/total-value-locked">USD value of total value locked</a>
			</div>
		</div>
		{#if hasTvlData}
			<PairCandleChart
				{pairId}
				{pairSymbol}
				{exchangeType}
				{firstTradeDate}
				{timeBucket}
				feed={quoteFeed('candles', { candle_type: 'tvl' }, dataToQuotes)}
				linker={chartLinker}
			/>
		{:else}
			<div class="no-chart-data">
				<Alert size="md" status="warning" title="No data available">
					TVL chart data not currently available for <strong>{pairSymbol}</strong>
				</Alert>
			</div>
		{/if}
	</div>
{:else}
	<div class="chart-wrapper">
		<div class="chart-title">
			<h3>Liquidity</h3>
			<div class="help">
				<span class="prefix">expressed as</span>
				<a class="body-link" target="_blank" href="/glossary/xy-liquidity-model">
					USD value of one side of XY liquidity curve
				</a>
			</div>
		</div>
		<PairCandleChart
			{pairId}
			{pairSymbol}
			{exchangeType}
			{firstTradeDate}
			{timeBucket}
			feed={quoteFeed('xyliquidity', null, dataToQuotes)}
			studies={['Liquidity AR']}
			linker={chartLinker}
		>
			<HudRow slot="hud-row-volume" let:cursor let:formatter>
				<HudMetric label="Vol Added" value={formatter(cursor.data.av)} direction={1}>
					<span class="vol-added">{formatter(cursor.data.av)}</span>
				</HudMetric>
				<HudMetric label="Vol Removed" value={formatter(cursor.data.rv)} direction={-1} />
			</HudRow>
		</PairCandleChart>
	</div>
{/if}

<style lang="postcss">
	.chart-header {
		display: flex;
		gap: var(--space-md);
		margin-bottom: 1em;

		@media (--viewport-md-down) {
			flex-direction: column;
		}

		h2 {
			flex: 1;
			font: var(--f-h2-medium);
			white-space: nowrap;
		}
	}

	.chart-wrapper {
		overflow: hidden;
	}

	.chart-title {
		display: flex;
		gap: var(--space-md);
		align-items: baseline;
		border-bottom: 1px solid #999;

		h3 {
			flex: 1;
			font: var(--f-h5-medium);
			text-transform: uppercase;
			letter-spacing: 0.06em;

			@media (--viewport-xs) {
				font: var(--f-h6-medium);
			}
		}

		.help {
			font: var(--f-ui-small-roman);
			color: var(--c-text-2-v1);
			text-align: right;

			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;

			a:hover {
				color: var(--c-text-1-v1);
			}

			.prefix {
				@media (--viewport-xs) {
					display: none;
				}
			}
		}
	}

	.vol-added {
		display: inline-block;
		min-width: 4.5em;
	}

	.no-chart-data {
		padding-block: 2rem;
		padding-inline: calc((100vw - min(70ch, 90vw)) / 2);
		border-bottom: 1px solid #999;
	}
</style>
