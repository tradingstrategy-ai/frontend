<!--
@component
Dynamically ChartIQ modules (if available) and render chart element.

#### Usage
```tsx
  <ChartIQ
    options={{ controls: { chartControls: null } }}
    init={ (chartEngine) => { chartEngine.doStuff() } }
    studies={['Some study']}
    linker={chartLinker}
    {quoteFeed}
    invalidate={[dep1, dep2]}
  >
		<ChartHudRow>...</ChartHudRow>
  </ChartIQ>
```
-->
<script context="module" lang="ts">
	import { browser } from '$app/environment';
	import * as studyModules from './studies';
	import './chart.css';

	/**
	 * NOTE: normal dynamic import doesn't work for optional dependency due to Vite's
	 * pre-bundling import analysis; using Vite's custom import.meta.glob instead.
	 * See: https://github.com/vitejs/vite/issues/6007#issuecomment-1110330733
	 */
	import.meta.glob('/node_modules/chartiq/css/stx-chart.css', { eager: true });
	const modules = import.meta.glob('/node_modules/chartiq/js/*.js');

	// NOTE: requested TypeScript defs from ChartIQ.
	// See: https://documentation.chartiq.com/tutorial-SDK%20API%20Reference.html#toc18__anchor
	let CIQ: any;

	async function initialize() {
		if (!browser || Object.keys(modules).length === 0) {
			throw new Error('chartiq module not available');
		}

		const [chartiqJs, standardJs]: [any, any] = await Promise.all([
			modules[`/node_modules/chartiq/js/chartiq.js`](),
			modules[`/node_modules/chartiq/js/standard.js`]()
		]);

		CIQ = chartiqJs.CIQ;
		CIQ.activateImports(standardJs.quoteFeed);

		for (const mod of Object.values(studyModules)) {
			const study = mod(CIQ);
			CIQ.Studies.studyLibrary[study.name] = study;
		}
	}
</script>

<script lang="ts">
	import type ChartLinker from './ChartLinker';
	import { fade } from 'svelte/transition';
	import ChartActivityTracker from './ChartActivityTracker';
	import { lightFormat as formatDate } from 'date-fns';
	import Spinner from 'svelte-spinner';
	import { AlertItem, AlertList } from '$lib/components';

	export let options: any = {};
	export let init: Function | undefined = undefined;
	export let studies: any[] = [];
	export let linker: ChartLinker | undefined = undefined;
	export let quoteFeed: any = undefined;
	export let invalidate: any = undefined;

	let loading = false;

	// NOTE: requested TypeScript defs from ChartIQ.
	let activeTick: any;

	function chartIQ(node: HTMLElement, deps: any) {
		let chartTracker;
		let chartEngine = new CIQ.ChartEngine({ container: node, ...options });

		// display X-Axis time markers in UTC
		chartEngine.setTimeZone(null, 'UTC');

		// attach custom studies - e.g., volume, liquidity bar charts
		for (const study of studies) {
			CIQ.Studies.addStudy(chartEngine, study);
		}

		// set default formatter for x-axis crosshair date label
		chartEngine.chart.xAxis.formatter = function (labelDate: Date) {
			const { period, interval, timeUnit } = chartEngine.getPeriodicity();
			const subDay = timeUnit === 'minute' && period * interval < 24 * 60;
			const format = subDay ? 'M/d HH:mm' : 'M/d/yyyy';
			return formatDate(labelDate, format);
		};

		// update active tick data based on crosshair position
		chartEngine.append('headsUpHR', () => {
			const tick = chartEngine.barFromPixel(chartEngine.cx);
			const prices = chartEngine.chart.xaxis[tick];
			if (prices) {
				activeTick = prices.data;
			}
		});

		// register this ChartEngine instance with ChartLinker (if provided)
		linker?.add(chartEngine);

		// ignore mouse/touch movements if chart is in loading state;
		// this must come _after_ linker registration (above)
		chartEngine.prepend('mousemoveinner', () => loading);

		// cancel mouseWheel zoom unless a modifier key is pressed
		chartEngine.prepend('mouseWheel', (event) => {
			const modifierPressed = event.ctrlKey || event.altKey || event.metaKey;
			const verticalScroll = Math.abs(event.deltaY) > Math.abs(event.deltaX);
			return !modifierPressed && verticalScroll;
		});

		// attach quoteFeed if provided (API data adapter)
		if (quoteFeed) {
			chartEngine.attachQuoteFeed(quoteFeed, {});
		}

		// fill gaps in data (closing price carried forward); see:
		// https://documentation.chartiq.com/CIQ.ChartEngine.html#cleanupGaps
		chartEngine.cleanupGaps = 'carry';

		// call init callback if provided
		const resp = init?.(chartEngine);

		// wrap loadChart method to inject callback
		const originalLoadChart = chartEngine.loadChart.bind(chartEngine);
		chartEngine.loadChart = (symbol: string, parameters: any, callback: Function | undefined) => {
			originalLoadChart(symbol, parameters, () => {
				loading = false;
				chartTracker ??= new ChartActivityTracker(chartEngine);
				callback?.();
			});
		};

		function destroy() {
			linker?.remove(chartEngine);
			resp?.destroy?.();
			chartEngine.destroy();
			chartEngine = null;
		}

		function update(...args: any) {
			loading = true;
			resp?.update?.(...args);
		}
		update(deps);

		return { destroy, update };
	}
</script>

{#await initialize() then}
	<div class="chart-container" use:chartIQ={invalidate} data-testid="chartIQ">
		<div class="inner">
			<slot {activeTick} />
		</div>
		{#if loading}
			<div class="loading" transition:fade={{ duration: 250 }}>
				<Spinner size="60" color="hsla(var(--hsl-text))" />
			</div>
		{/if}
	</div>
{:catch}
	<AlertList status="warning">
		<AlertItem>
			ChartIQ charting library notavailable. ChartIQ is an optional proprietary dependency that requires a license.
		</AlertItem>
	</AlertList>
{/await}

<style lang="postcss">
	.chart-container {
		--CHART-aspect-ratio: 16/9;
		position: relative;
		aspect-ratio: var(--chart-aspect-ratio, var(--CHART-aspect-ratio));

		@media (--viewport-sm-down) {
			--CHART-aspect-ratio: 3/2;
		}

		@media (--viewport-xs) {
			--CHART-aspect-ratio: 4/6;
		}

		& :is(.loading, .inner) {
			position: absolute;
			top: 0;
			bottom: 0;
			left: 0;
			right: 0;
		}

		& .inner {
			z-index: 99;
		}

		& .loading {
			z-index: 100;
			display: flex;
			justify-content: center;
			align-items: center;
			background: hsla(var(--hsl-body), 0.75);
		}
	}
</style>
