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

<div>
    <h3>Price and volume chart</h3>
    <ChartIQ
        feed={quoteFeed('price')}
        {pairId}
        timeBucket={bucket}
        studies={['Volume Underlay']}
        linker={chartLinker}
    >
    </ChartIQ>
    <p class="help">
        Trading activity expressed as
        <a rel="external" href="https://tradingstrategy.ai/docs/glossary.html#term-OHLCV">
            OHLCV candles.
        </a>
    </p>
</div>

<div>
    <h3>Liquidity chart</h3>
    <ChartIQ
        feed={quoteFeed('liquidity')}
        {pairId}
        timeBucket={bucket}
        studies={['Liquidity AR']}
        linker={chartLinker}
    >
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
</style>
