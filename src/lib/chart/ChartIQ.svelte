<script context="module">
  import { browser } from '$app/env';

  let CIQ, initialized;

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
      throw new Error('chartiq not loaded!');
    }

    await importMod('css/chartiq.css');
    const module = await importMod('js/standard.js');
    CIQ = module.CIQ;
  }

  if (browser) initialized = initialize();
</script>

{#await initialized}
  <p>Loading ChartIQ library…</p>
{:then}
  <p>ChartIQ loaded!</p>
{:catch}
  <p>ChartIQ library not available</p>
{/await}
