<!--
@component
Used for loading ChartIQ candle (ohlc+v) chart. Dyamically imports optional
chartiq dependency.

#### Usage:
```tsx
  <ChartIQ feed={quotefeed} pairId={12345} timeBucket="4h">
    Fallback content to display if chartiq not imported
  </ChartIQ>
```
-->
<script context="module" lang="ts">
  let CIQ;

  /**
   * NOTE: normal dynamic import doesn't work for optional dependency due to
   * Vite's pre-bundling import analysis; using Vite's custom import.meta.glob
   * instead.
   * See: https://github.com/vitejs/vite/issues/6007#issuecomment-1110330733
   */
  const modules = import.meta.glob('/node_modules/chartiq/{js,css}/*.{js,css}');

  function importMod(path) {
    return modules[`/node_modules/chartiq/${path}`]();
  }

  async function initialize() {
    if (Object.keys(modules).length === 0) {
      return false;
    }
    await Promise.all([ importCss(), importJs() ]);
    return true;
  }

  async function importCss() {
    await importMod('css/stx-chart.css');
    await import('./chart.css');
  }

  async function importJs() {
    const [ chartiqJs, standardJs, studies] = await Promise.all([
      importMod('js/chartiq.js'),
      importMod('js/standard.js'),
      import('./studies')
    ]);

    CIQ = chartiqJs.CIQ;
    CIQ.activateImports(standardJs.quoteFeed);

    for (const key in studies) {
      const study = studies[key](CIQ);
      CIQ.Studies.studyLibrary[study.name] = study;
    }
  }
</script>

<script lang="ts">
  import type { TimeBucket } from './timeBucketConverters';
  import { timeBucketToPeriodicity } from './timeBucketConverters';
  import { formatDollar, formatPriceChange } from '$lib/helpers/formatters';
  import { determinePriceChangeClass } from "$lib/helpers/price";

  export let feed: object;
  export let pairId: number;
  export let timeBucket: TimeBucket;
  export let studies = [];
  export let linker = null;

  $: periodicity = timeBucketToPeriodicity(timeBucket);

  let active;
  $: priceChangeAmt = active && active.Close - active.Open;
  $: priceChangePct = active && priceChangeAmt / active.Open;

  const chartOptions = {
    layout: { crosshair: true },
    controls: { chartControls: null },
    dontRoll: true
  };

  function formatForHud(value: number) {
    return formatDollar(value, 3, 3, '');
  }

  function chartIQ(node: HTMLElement, { pairId, periodicity }) {
    let prevPairId = pairId;

    let chartEngine = new CIQ.ChartEngine({
      container: node,
      ...chartOptions
    });

    for (const study of studies) {
      CIQ.Studies.addStudy(chartEngine, study);
    }

    // match the current price label precision to other yAxis labels
    chartEngine.addEventListener('symbolChange', () => {
      chartEngine.chart.yAxis.maxDecimalPlaces = chartEngine.chart.yAxis.printDecimalPlaces;
    });

    // cancel mouseWheel zoom unless a modifier key is pressed
    chartEngine.prepend('mouseWheel', (event) => {
      const modifierPressed = event.ctrlKey || event.altKey || event.metaKey;
      const verticalScroll = Math.abs(event.deltaY) > Math.abs(event.deltaX);
      return !modifierPressed && verticalScroll;
    });

    chartEngine.append("headsUpHR", () => {
      const tick = chartEngine.barFromPixel(chartEngine.cx);
      const prices = chartEngine.chart.xaxis[tick];
      if (prices) active = prices.data;
    });

    linker?.add(chartEngine);

    chartEngine.attachQuoteFeed(feed, {});
    chartEngine.loadChart(pairId, { periodicity });

    function update({ pairId, periodicity }) {
      if (pairId !== prevPairId) {
        chartEngine.loadChart(pairId);
        prevPairId = pairId;
      }
      chartEngine.setPeriodicity(periodicity);
    }

    function destroy() {
      linker?.remove(chartEngine);
      chartEngine.destroy();
      chartEngine = null;
    }

    return { update, destroy };
  }
</script>

{#await initialize() then success}
    {#if success}
        <div
          class="chart-container"
          use:chartIQ={{ pairId, periodicity }}
          data-testid="chartiq-widget"
        >
            {#if active}
                <div class="hud">
                    <slot name="hud-row-1" {active} {formatForHud}>
                        <div class="hud-row {determinePriceChangeClass(priceChangeAmt)}">
                            <dl><dt>O</dt><dd>{formatForHud(active.Open)}</dd></dl>
                            <dl><dt>H</dt><dd>{formatForHud(active.High)}</dd></dl>
                            <dl><dt>L</dt><dd>{formatForHud(active.Low)}</dd></dl>
                            <dl><dt>C</dt><dd>{formatForHud(active.Close)}</dd></dl>
                            <dl><dd>{formatForHud(priceChangeAmt)}</dd></dl>
                            <dl><dd>{formatPriceChange(priceChangePct)}</dd></dl>
                        </div>
                    </slot>
                    <slot name="hud-row-2" {active} {formatForHud}>
                        <div class="hud-row">
                            <dl><dt>Vol</dt><dd>{formatForHud(active.Volume)}</dd></dl>
                        </div>
                    </slot>
                </div>
            {/if}
        </div>
    {:else}
        ChartIQ not available
    {/if}
{/await}

<style>
  .chart-container {
    position: relative;
    aspect-ratio: 16/9;
  }

  .hud {
    position: absolute;
    top: 0;
    left: 0;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 14px;
  }

  .hud :global(.hud-row) {
    display: flex;
  }

  .hud :global(dl) {
    display: flex;
    margin-bottom: 0;
  }

  .hud :global(dt) {
    margin-right: 0.5ex;
    color: rgba(0, 0, 0, 0.7);
    font-weight: 500;
  }

  .hud :global(dd) {
    margin-bottom: 0;
    margin-right: 1ex;
    font-weight: 400;
  }
</style>
