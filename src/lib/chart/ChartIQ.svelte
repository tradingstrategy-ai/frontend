<!--
@component
Used for loading ChartIQ candle (ohlc+v) chart. Dyamically imports optional
chartiq dependency.

#### Usage:
```tsx
	<ChartIQ
		feed={quoteFeed}
		pairId={12345}
		exchangeType="uniswap_v2"
		firstTradeDate="2020-01-02T00:00"
		timeBucket="4h"
		studies={['Volume Underlay']}
		linker={chartLinker}
	>
		Fallback content to display if chartiq not imported
  </ChartIQ>
```
-->
<script context="module" lang="ts">
	import { browser } from '$app/environment';

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
		if (!browser || Object.keys(modules).length === 0) {
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
	import { addHours, format as formatDate } from 'date-fns';
	import type { TimeBucket } from './timeBucketConverters';
	import { timeBucketToPeriodicity } from './timeBucketConverters';
	import { formatDollar, formatPriceChange } from '$lib/helpers/formatters';
	import { determinePriceChangeClass } from '$lib/helpers/price';
	import { fade } from 'svelte/transition';
	import Spinner from 'svelte-spinner';
	import ChartActivityTracker from './ChartActivityTracker';

	export let feed: object;
	export let pairId: number | string;
	export let exchangeType: string;
	export let firstTradeDate: string;
	export let timeBucket: TimeBucket;
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

	function chartIQ(node: HTMLElement, options: any) {
		let chartTracker;

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
			if (prices) {
				activeTick = prices.data;
				// HACK to address ChartIQ bug - times in floating x-axis label are off by 3h for 4h timeBucket
				const displayDate = timeBucket === '4h' ? addHours(prices.DT, 3) : new Date(prices.DT);
				const dateFormat = periodicity.timeUnit === 'minute' ? 'M/d HH:mm' : 'M/d/yyyy';
				chartEngine.controls.floatDate.innerHTML = formatDate(displayDate, dateFormat);
			}
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

		// update the chart - used on both initial load and updates
		function update() {
			loading = true;
			// hide the Y Axis on smaller screens
			chartEngine.chart.yAxis.position = showYAxis ? 'right' : 'none';
			// make exchangeType and firstTradeDate available to the quoteFeed
			chartEngine.exchangeType = exchangeType;
			chartEngine.firstTradeDate = firstTradeDate;
			// load the chart
			chartEngine.loadChart(pairId, { periodicity }, () => {
				loading = false;
				chartTracker ??= new ChartActivityTracker(chartEngine);
			});
		}
		update();

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
			use:chartIQ={{ pairId, periodicity, showYAxis, firstTradeDate, exchangeType }}
			data-testid="chartIQ"
		>
			{#if loading}
				<div class="loading" transition:fade={{ duration: 250 }}>
					<Spinner size="60" color="var(--c-text-1-v1)" />
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

<style lang="postcss">
	.chart-container {
		position: relative;
		aspect-ratio: 16/9;

		@media (--viewport-sm-down) {
			aspect-ratio: 3/2;
		}

		@media (--viewport-xs) {
			aspect-ratio: 4/3;
		}
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
		background-color: hsla(var(--hsl-body));
		opacity: 0.75;
	}

	.hud :global {
		position: absolute;
		top: 4px;
		left: 0;
		font: var(--f-ui-xsmall-roman);
		letter-spacing: 0.02em;

		& .hud-row {
			display: flex;
			gap: 0.5em;
		}

		& dl {
			display: flex;
			gap: var(--space-xxs);
			align-items: center;
			margin: 0;
		}

		& dt {
			color: var(--c-text-3-v1);
			font-weight: inherit;
		}

		& dd {
			margin: 0;
		}
	}
</style>
