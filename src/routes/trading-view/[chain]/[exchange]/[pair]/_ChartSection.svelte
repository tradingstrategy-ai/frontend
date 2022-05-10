<script lang="ts">
  import { page } from '$app/stores';
  import TimeBucketSelector from '$lib/chart/TimeBucketSelector.svelte';
  import ChartIQ from '$lib/chart/ChartIQ.svelte';
  import quoteFeed from '$lib/chart/quoteFeed';
  import ChartLinker from '$lib/chart/ChartLinker';

  export let pairSymbol;
  export let pairId;

  const chartLinker = new ChartLinker();

  $: timeBucket = $page.url.hash.slice(1) || '4h';
</script>

<div class="chart-header">
  <h2>{pairSymbol} charts</h2>
  <TimeBucketSelector active={timeBucket} />
</div>

<div class="chart-wrapper">
    <div class="chart-title">
        <h3>Price & volume</h3>
        <div class="help">
            expressed as
            <a target="_blank" href="https://tradingstrategy.ai/docs/glossary.html#term-OHLCV">
                OHLCV candles
            </a>
        </div>
    </div>
    <ChartIQ
        feed={quoteFeed('price')}
        {pairId}
        {timeBucket}
        studies={['Volume Underlay']}
        linker={chartLinker}
    />
</div>

<div class="chart-wrapper">
    <div class="chart-title">
        <h3>Liquidity</h3>
        <div class="help">
            expressed as
            <a target="_blank" href="https://tradingstrategy.ai/docs/glossary.html#term-XY-liquidity-model">
                USD value of one side of XY liquidity curve
            </a>
        </div>
    </div>
    <ChartIQ
        feed={quoteFeed('liquidity')}
        {pairId}
        {timeBucket}
        studies={['Liquidity AR']}
        linker={chartLinker}
    >
        <div slot="hud-row-2" class="hud-row" let:active let:formatForHud>
            <dl class="vol-added"><dt>Vol Added</dt><dd>{formatForHud(active.av)}</dd></dl>
            <dl class="vol-removed"><dt>Vol Removed</dt><dd>{formatForHud(active.rv)}</dd></dl>
        </div>
    </ChartIQ>
</div>

<style>
  .chart-header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
  }

  h2 {
    flex: 1;
    font-size: 2rem;
    white-space: nowrap;
  }

  .chart-title {
    display: flex;
    align-items: baseline;
    border-bottom: 1px solid #999;
  }

  .chart-wrapper {
    margin: 20px 0;
  }

  h3 {
    flex: 1;
    font-size: 1.25rem;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .help {
    font-size: 0.875rem;
    text-align: right;
  }

  .help a {
    font-weight: 500;
    color: #525480;
  }

  .help a:hover {
    text-decoration: underline;
  }

  .vol-added dd {
    color: var(--price-up-green);
    min-width: 4.5em;
  }

  .vol-removed dd {
    color: var(--price-down-red);
  }
</style>
