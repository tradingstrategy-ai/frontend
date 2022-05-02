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
    const [ chartiqJs, standardJs, advancedJs ] = await Promise.all([
      importMod('js/chartiq.js'),
      importMod('js/standard.js'),
      importMod('js/advanced.js')
    ]);

    CIQ = chartiqJs.CIQ;
    CIQ.activateImports(standardJs.quoteFeed, advancedJs.volumeStudies);
  }
</script>

<script lang="ts">
  export let feed: object;
  export let pairId: number;
  export let timeBucket: string;

  const timeUnits = {
    m: 'minute',
    h: 'hour',
    d: 'day'
  };

  function getPeriodicity(bucket: string) {
    const [, quantity, unit ] = bucket.match(/^(\d+)(\w)$/);
    const timeUnit = timeUnits[unit];
    let interval = Number.parseInt(quantity, 10);
    let period = 1;

    if (timeUnit === 'day') {
      period = interval;
      interval = 1;
    }

    return { period, interval, timeUnit };
  }

  $: periodicity = getPeriodicity(timeBucket);

  const chartOptions = {
    layout: { crosshair: true },
    controls: { chartControls: null }
  };

  function chartIQ(node, { periodicity }) {
    const stxx = new CIQ.ChartEngine({
      container: node,
      ...chartOptions
    });

    CIQ.Studies.addStudy(stxx, "vol undr", {}, {
      'Up Volume': '#458b00',
      'Down Volume': '#cc0000'
    });

    stxx.attachQuoteFeed(feed, {});
    stxx.loadChart(pairId, { periodicity });

    function update({ periodicity }) {
      stxx.setPeriodicity(periodicity);
    }

    return { update };
  }
</script>

{#await initialize() then success}
    {#if success}
        <div
          use:chartIQ={{ periodicity }}
          data-testid="chartiq-widget"
        />
    {:else}
        <slot />
    {/if}
{/await}

<style>
  div {
    position: relative;
    aspect-ratio: 16/9;
  }
</style>
