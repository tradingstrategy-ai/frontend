<script lang="ts">
  import { browser } from '$app/env';
  import TimeBucketSelector, { fromHashToTimeBucket } from '$lib/chart/TimeBucketSelector.svelte';
  import ChartIQ from '$lib/chart/ChartIQ.svelte';
  import quoteFeed from '$lib/chart/quoteFeed';
  import ChartLinker from '$lib/chart/ChartLinker';

  export let pairSymbol;
  export let pairId;

  const chartLinker = new ChartLinker();

  // Resolve the initial candle stick chart from the fragment parameter
  let hash = null;
  if (browser) hash = window.location.hash;
  let bucket = fromHashToTimeBucket(hash);
</script>

<h2>{pairSymbol} charts</h2>

<TimeBucketSelector bind:activeBucket={bucket} />

<div class="chart-wrapper">
    <h3>Price and volume chart</h3>
    <ChartIQ
        feed={quoteFeed('price')}
        {pairId}
        timeBucket={bucket}
        studies={['Volume Underlay']}
        linker={chartLinker}
    />
    <p class="help">
        Trading activity expressed as
        <a rel="external" href="https://tradingstrategy.ai/docs/glossary.html#term-OHLCV">
            OHLCV candles.
        </a>
    </p>
</div>

<div class="chart-wrapper">
    <h3>Liquidity chart</h3>
    <ChartIQ
        feed={quoteFeed('liquidity')}
        {pairId}
        timeBucket={bucket}
        studies={['Liquidity AR']}
        linker={chartLinker}
    >
        <div slot="hud-row-2" class="hud-row" let:active let:formatForHud>
            <dl class="vol-added"><dt>Vol Added</dt><dd>{formatForHud(active.av)}</dd></dl>
            <dl class="vol-removed"><dt>Vol Removed</dt><dd>{formatForHud(active.rv)}</dd></dl>
        </div>
    </ChartIQ>
    <p class="help">
        Available liquidity expressed as
        <a rel="external" href="https://tradingstrategy.ai/docs/glossary.html#term-XY-liquidity-model">
            the US Dollar value of one side of XY liquidity curve.
        </a>
    </p>
</div>

<style>
  h2 {
    font-size: 2rem;
  }

  .chart-wrapper {
    margin: 20px 0;
  }

  .help {
    text-align: center;
    font-size: 80%;
    color: #525480;
  }

  .vol-added dd {
    color: var(--price-up-green);
    min-width: 4.5em;
  }

  .vol-removed dd {
    color: var(--price-down-red);
  }
</style>
