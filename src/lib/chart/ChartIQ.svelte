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
		await Promise.all([importCss(), importJs()]);
		return true;
	}

	async function importCss() {
		await importMod('css/stx-chart.css');
		await import('./chart.css');
	}

	async function importJs() {
		const [chartiqJs, standardJs, studies] = await Promise.all([
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
	import { determinePriceChangeClass } from '$lib/helpers/price';
	import { fade } from 'svelte/transition';
	import Spinner from 'svelte-spinner';

	export let feed: object;
	export let pairId: number | string;
	export let timeBucket: TimeBucket;
	export let firstTradeDate: string;
	export let studies = [];
	export let linker = null;

	let loading = false;

	$: periodicity = timeBucketToPeriodicity(timeBucket);

	let activeTick;
	$: priceChangeAmt = activeTick && activeTick.Close - activeTick.Open;
	$: priceChangePct = activeTick && priceChangeAmt / activeTick.Open;

	let ww;
	$: showYAxis = ww >= 576;

	function formatForHud(value: number) {
		return formatDollar(value, 3, 3, '');
	}

	function chartIQ(node: HTMLElement, options) {
		let prevPairId = options.pairId;

		let chartEngine = new CIQ.ChartEngine({
			container: node,
			layout: { crosshair: true },
			controls: { chartControls: null },
			dontRoll: true
		});

		// display X-Axis time markers in UTC
		chartEngine.setTimeZone(null, 'UTC');

		// attach custom studies - e.g., volume, liquidity bar charts
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

		// update active tick data based on crosshair position
		chartEngine.append('headsUpHR', () => {
			const tick = chartEngine.barFromPixel(chartEngine.cx);
			const prices = chartEngine.chart.xaxis[tick];
			if (prices) activeTick = prices.data;
		});

		// register this ChartEngine instance with ChartLinker (if provided)
		linker?.add(chartEngine);

		// ignore mouse/touch movements if chart is in loading state;
		// this must come _after_ linker registration (above)
		chartEngine.prepend('mousemoveinner', () => {
			return loading;
		});

		// attach the provided quote feed (API data adapter)
		chartEngine.attachQuoteFeed(feed, {});

		// fill gaps in data (closing price carried forward); see:
		// https://documentation.chartiq.com/CIQ.ChartEngine.html#cleanupGaps
		chartEngine.cleanupGaps = 'carry';

		// hide the Y Axis on smaller screens
		function setYAxis() {
			chartEngine.chart.yAxis.position = showYAxis ? 'right' : 'none';
		}

		// load the chart! used for both initial load and updates
		function loadChart() {
			loading = true;

			// make firstTradeDate available to the quoteFeed
			chartEngine.chart.firstTradeDate = firstTradeDate;

			chartEngine.loadChart(pairId, { periodicity }, () => {
				loading = false;
			});
		}

		function updatePeriodicity() {
			loading = true;

			// disable crosshairs and zoom while loading
			chartEngine.hideCrosshairs();
			chartEngine.allowZoom = false;

			chartEngine.setPeriodicity(periodicity, () => {
				chartEngine.showCrosshairs();
				chartEngine.allowZoom = true;
				loading = false;
			});
		}

		setYAxis();
		loadChart();

		// handle changes to action params
		function update(options) {
			if (options.pairId !== prevPairId) {
				// pairId changed - reload chart with new pairId & firstTradeDate
				loadChart();
				prevPairId = options.pairId;
			} else {
				// otherwise, assume periodicity changed
				updatePeriodicity();
			}
			setYAxis();
		}

		function destroy() {
			linker?.remove(chartEngine);
			chartEngine.destroy();
			chartEngine = null;
		}

		return { update, destroy };
	}
</script>

<svelte:window bind:innerWidth={ww} />

{#await initialize() then success}
	{#if success}
		<div
			class="chart-container"
			use:chartIQ={{ pairId, periodicity, showYAxis, firstTradeDate }}
			data-testid="chartiq-widget"
		>
			{#if loading}
				<div class="loading" transition:fade={{ duration: 250 }}>
					<Spinner size="60" />
				</div>
			{/if}
			{#if activeTick}
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

	.loading {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 100;
		display: flex;
		justify-content: center;
		align-items: center;
		background: rgba(255, 241, 229, 0.75);
	}

	.hud {
		position: absolute;
		top: 4px;
		left: 0;
		font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
		font-size: 0.875rem;
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

	@media (max-width: 768px) {
		.chart-container {
			aspect-ratio: 3/2;
		}
	}

	@media (max-width: 576px) {
		.chart-container {
			aspect-ratio: 4/3;
		}

		.hud {
			font-size: 0.75rem;
		}
	}
</style>
