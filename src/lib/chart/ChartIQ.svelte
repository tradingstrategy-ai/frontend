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
    feed={quoteFeed(…)}
    invalidate={[dep1, dep2]}
  >
		<HudRow>...</HudRow>
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
	const keyFile = import.meta.glob('/node_modules/chartiq/key.js', { import: 'default' });
	const modules = import.meta.glob('/node_modules/chartiq/js/*.js');

	// NOTE: requested TypeScript defs from ChartIQ.
	// See: https://documentation.chartiq.com/tutorial-SDK%20API%20Reference.html#toc18__anchor
	let CIQ: any;

	async function initialize() {
		if (!browser || Object.keys(modules).length === 0) {
			throw new Error('chartiq module not available');
		}

		const [getLicenseKey, chartiqJs, standardJs]: [any, any, any] = await Promise.all([
			keyFile['/node_modules/chartiq/key.js'](),
			modules['/node_modules/chartiq/js/chartiq.js'](),
			modules['/node_modules/chartiq/js/standard.js']()
		]);

		CIQ = chartiqJs.CIQ;
		getLicenseKey(CIQ);
		CIQ.activateImports(standardJs.quoteFeed);

		for (const mod of Object.values(studyModules)) {
			const study = mod(CIQ);
			CIQ.Studies.studyLibrary[study.name] = study;
		}
	}
</script>

<script lang="ts">
	import { fade } from 'svelte/transition';
	import { lightFormat as formatDate } from 'date-fns';
	import { type ChartLinker, type QuoteFeed, ChartActivityTracker } from '$lib/chart';
	import { Alert } from '$lib/components';
	import Spinner from 'svelte-spinner';

	export let options: any = {};
	export let init: Function | undefined = undefined;
	export let studies: any[] = [];
	export let linker: ChartLinker | undefined = undefined;
	export let feed: QuoteFeed | undefined = undefined;
	export let invalidate: any = undefined;

	let loading = false;

	interface ChartCursor {
		position: {
			cx?: number;
			cy?: number;
			DateX?: number;
			CloseY?: number;
		};
		data?: any;
	}

	let cursor: ChartCursor = { position: {} };

	function chartIQ(node: HTMLElement, deps: any) {
		let chartTracker;
		let chartEngine = new CIQ.ChartEngine({ container: node, ...options });

		// Prevent long candle wicks from exploding the yAxis scale.
		// see: quoteFeed#clippedValues
		// see: https://documentation.chartiq.com/CIQ.ChartEngine.html#determineMinMax
		chartEngine.origDetermineMinMax = chartEngine.determineMinMax;
		// @ts-ignore
		chartEngine.determineMinMax = function (_q, fields, _s, _b, _l, _c, _p, axis, _f) {
			if (axis.name === 'chart') {
				fields = fields.map((field: string) => field.replace(/^(High|Low)$/, 'Clipped$1'));
			}
			return chartEngine.origDetermineMinMax(_q, fields, _s, _b, _l, _c, _p, axis, _f);
		};

		// display X-Axis time markers in UTC
		chartEngine.setTimeZone(null, 'UTC');

		// set default formatter for x-axis crosshair date label
		chartEngine.chart.xAxis.formatter = function (labelDate: Date) {
			const { period, interval, timeUnit } = chartEngine.getPeriodicity();
			const subDay = timeUnit === 'minute' && period * interval < 24 * 60;
			const format = subDay ? 'M/d HH:mm' : 'M/d/yyyy';
			return formatDate(labelDate, format);
		};

		// update cursor / tick data based on pointer position
		chartEngine.append('headsUpHR', () => {
			const tick = chartEngine.tickFromPixel(chartEngine.cx);
			const data = chartEngine.chart.dataSet[tick];

			const position = {
				cx: chartEngine.cx,
				cy: chartEngine.cy,
				DateX: data && chartEngine.pixelFromDate(data.DT),
				CloseY: data && chartEngine.pixelFromPrice(data.Close)
			};

			// ChartIQ doesn't preserve original UTC date; restore it from tz-adjusted DT value
			if (data) {
				data.originalDate = new Date(data.DT.getTime() - data.DT.getTimezoneOffset() * 60000);
			}

			cursor = { position, data };
		});

		// clear cursor when pointer exits chart area
		chartEngine.append('handleMouseOut', () => {
			cursor = { position: {} };
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
		if (feed) {
			chartEngine.attachQuoteFeed(feed, {});
		}

		// fill gaps in data (closing price carried forward); see:
		// https://documentation.chartiq.com/CIQ.ChartEngine.html#cleanupGaps
		chartEngine.cleanupGaps = 'carry';

		// call init callback if provided
		const resp = init?.(chartEngine);

		// wrap loadChart method to inject callback
		const originalLoadChart = chartEngine.loadChart.bind(chartEngine);
		chartEngine.loadChart = (symbol: any, parameters: any, callback: Function | undefined) => {
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

			// clear attached studies
			chartEngine.clear();

			// attach custom studies - e.g., volume, liquidity bar charts
			for (const study of studies) {
				CIQ.Studies.addStudy(chartEngine, study);
			}

			// invoke update function returned from init callback (if provided)
			resp?.update?.(...args);
		}
		update(deps);

		return { destroy, update };
	}
</script>

{#await initialize() then}
	<div class="chart-container" use:chartIQ={invalidate} data-testid="chartIQ">
		<div class="inner">
			<slot {cursor} />
		</div>
		{#if loading}
			<div class="loading" transition:fade={{ duration: 250 }}>
				<Spinner size="60" color="hsla(var(--hsl-text))" />
			</div>
		{/if}
	</div>
{:catch}
	<Alert status="warning">
		ChartIQ charting library notavailable. ChartIQ is an optional proprietary dependency that requires a license.
	</Alert>
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

		:is(.loading, .inner) {
			position: absolute;
			top: 0;
			bottom: 0;
			left: 0;
			right: 0;
		}

		.inner {
			z-index: 99;
			pointer-events: none;
		}

		.loading {
			z-index: 100;
			display: flex;
			justify-content: center;
			align-items: center;
			background: hsla(var(--hsl-body), 0.75);
		}
	}
</style>
