<!--
@component
Displays trading pair price/volume and liquidity charts. The two charts are
linked so they scroll/zoom together and display crosshairs and HUD data
for the same hovered date. Also displays a time-bucket selector.

#### Usage:
```tsx
  <ChartSection
    pairId={12345}
    pairSymbol={"ELON-ETH"}
    firstTradeDate={"2020-01-02T00:00"}
  />
```
-->
<script lang="ts">
	import { page } from '$app/stores';
	import type { TimeBucket } from '$lib/chart/timeBucketConverters';
	import TimeBucketSelector from '$lib/chart/TimeBucketSelector.svelte';
	import ChartIQ from '$lib/chart/ChartIQ.svelte';
	import quoteFeed from '$lib/chart/quoteFeed';
	import ChartLinker from '$lib/chart/ChartLinker';

	export let pairSymbol: string;
	export let pairId: number | string;
	export let firstTradeDate: string;

	const chartLinker = new ChartLinker();

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
			<a class="body-link" target="_blank" href="https://tradingstrategy.ai/docs/glossary.html#term-OHLCV">
				OHLCV candles
			</a>
		</div>
	</div>
	<ChartIQ
		feed={quoteFeed('price')}
		{pairId}
		{timeBucket}
		{firstTradeDate}
		studies={['Volume Underlay']}
		linker={chartLinker}
	/>
</div>

<div class="chart-wrapper">
	<div class="chart-title">
		<h3>Liquidity</h3>
		<div class="help">
			<span class="prefix">expressed as</span>
			<a class="body-link" target="_blank" href="https://tradingstrategy.ai/docs/glossary.html#term-XY-liquidity-model">
				USD value of one side of XY liquidity curve
			</a>
		</div>
	</div>
	<ChartIQ
		feed={quoteFeed('liquidity')}
		{pairId}
		{timeBucket}
		{firstTradeDate}
		studies={['Liquidity AR']}
		linker={chartLinker}
	>
		<div slot="hud-row-2" class="hud-row" let:activeTick let:formatForHud>
			<dl class="vol-added">
				<dt>Vol Added</dt>
				<dd>{formatForHud(activeTick.av)}</dd>
			</dl>
			<dl class="vol-removed">
				<dt>Vol Removed</dt>
				<dd>{formatForHud(activeTick.rv)}</dd>
			</dl>
		</div>
	</ChartIQ>
</div>

<style lang="postcss">
	.chart-header {
		display: flex;
		gap: 1rem;
		margin-bottom: 1em;

		@media (--viewport-md-down) {
			flex-direction: column;
		}

		& h2 {
			flex: 1;
			white-space: nowrap;
		}
	}

	.chart-wrapper {
		overflow: hidden;
	}

	.chart-title {
		display: flex;
		gap: 1rem;
		align-items: baseline;
		border-bottom: 1px solid #999;

		& h3 {
			flex: 1;
			font-size: 1.25rem;
			text-transform: uppercase;
			letter-spacing: 0.06em;

			@media (width <= 576px) {
				font-size: 1rem;
			}
		}

		& .help {
			font: var(--f-ui-small-roman);
			color: var(--c-text-2);
			text-align: right;

			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;

			& a:hover {
				color: var(--c-text-1);
			}

			& .prefix {
				@media (width <= 576px) {
					display: none;
				}
			}
		}
	}

	.vol-added dd {
		color: var(--c-bullish);
		min-width: 4.5em;
	}

	.vol-removed dd {
		color: var(--c-bearish);
	}
</style>
