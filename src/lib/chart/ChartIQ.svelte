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
	export let CIQ: any;

	async function initialize() {
		if (!browser || Object.keys(modules).length === 0) {
			throw new Error('chartiq module not available');
		}

		const [getLicenseKey, ChartIQ, Standard]: any[] = await Promise.all([
			keyFile['/node_modules/chartiq/key.js'](),
			modules['/node_modules/chartiq/js/chartiq.js'](),
			modules['/node_modules/chartiq/js/standard.js']()
		]);

		CIQ = ChartIQ.CIQ;
		getLicenseKey(CIQ);
		CIQ.activateImports(Standard.quoteFeed);

		for (const mod of Object.values(studyModules)) {
			const study = mod(CIQ);
			CIQ.Studies.studyLibrary[study.name] = study;
		}
	}
</script>

<script lang="ts">
	import { fade } from 'svelte/transition';
	import { floorUTCDate, addUTCDays } from '$lib/helpers/date';
	import { type ChartLinker, type QuoteFeed, ChartActivityTracker } from '$lib/chart';
	import { Alert, Spinner } from '$lib/components';

	export let options: any = {};
	export let init: Function | undefined = undefined;
	export let studies: any[] = [];
	export let linker: ChartLinker | undefined = undefined;
	export let feed: QuoteFeed | undefined = undefined;
	export let invalidate: any[] = [];
	export let loading = false;

	let updating = false;

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
		chartEngine.determineMinMax = (_q, fields, _s, _b, _l, _c, _p, axis, _f) => {
			if (axis.name === 'chart') {
				fields = fields.map((field: string) => field.replace(/^(High|Low)$/, 'Clipped$1'));
			}
			return chartEngine.origDetermineMinMax(_q, fields, _s, _b, _l, _c, _p, axis, _f);
		};

		// display X-Axis time markers in UTC
		chartEngine.setTimeZone(null, 'UTC');

		// set locale (for date and number formatting)
		CIQ.I18N.setLocale(chartEngine, 'en-GB');

		// override date formatters to use ISO-style formatting
		// see: https://documentation.chartiq.com/CIQ.I18N.html#.setLocale
		chartEngine.internationalizer.yearMonthDay = {
			format(date: Date) {
				return date.toISOString().slice(0, 10); // YYYY-MM-DD
			}
		};

		chartEngine.internationalizer.monthDay = {
			format(date: Date) {
				return date.toISOString().slice(5, 10); // MM-DD
			}
		};

		// set default formatter for x-axis crosshair date label
		chartEngine.chart.xAxis.formatter = (labelDate: Date) => {
			const { period, interval, timeUnit } = chartEngine.getPeriodicity();
			const { monthDay, yearMonthDay, hourMinute } = chartEngine.internationalizer;
			if (timeUnit === 'minute' && period * interval < 24 * 60) {
				return `${monthDay.format(labelDate)} ${hourMinute.format(labelDate)} UTC`;
			}
			return yearMonthDay.format(labelDate);
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
				const { timeUnit } = chartEngine.getPeriodicity();
				if (timeUnit === 'day') {
					data.adjustedDate = addUTCDays(floorUTCDate(data.DT), 1);
				} else {
					data.adjustedDate = new Date(data.DT);
				}
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
		chartEngine.prepend('mousemoveinner', () => loading || updating);

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
		const updateCallback = init?.(chartEngine);

		// wrap loadChart method to inject callback
		const originalLoadChart = chartEngine.loadChart.bind(chartEngine);
		chartEngine.loadChart = (symbol: any, parameters: any, callback: Function | undefined) => {
			originalLoadChart(symbol, parameters, () => {
				updating = false;
				chartTracker ??= new ChartActivityTracker(chartEngine);
				callback?.();
			});
		};

		function destroy() {
			linker?.remove(chartEngine);
			chartEngine.destroy();
			chartEngine = null;
		}

		function update(...args: any) {
			updating = true;

			// clear attached studies
			chartEngine.clear();

			// attach custom studies - e.g., volume, liquidity bar charts
			for (const study of studies) {
				CIQ.Studies.addStudy(chartEngine, study);
			}

			// invoke updateCallback function returned from init callback (if provided)
			updateCallback?.(...args);
		}
		update(deps);

		return { destroy, update };
	}
</script>

<div class="chart-iq" data-css-props>
	{#if loading || updating}
		<div class="loading" transition:fade={{ duration: 250 }}>
			<Spinner size="60" />
		</div>
	{/if}

	<div class="overlay">
		<slot {cursor} />
	</div>

	{#await initialize() then}
		<div use:chartIQ={[loading, ...invalidate]} data-testid="chartIQ" />
	{:catch}
		<div class="error">
			<Alert size="md" status="warning" title="ChartIQ Error">
				ChartIQ charting library not available. ChartIQ is an optional proprietary dependency that requires a license.
			</Alert>
		</div>
	{/await}
</div>

<style lang="postcss">
	[data-css-props] {
		--chart-aspect-ratio: 16/9;

		@media (--viewport-sm-down) {
			--chart-aspect-ratio: 3/2;
		}

		@media (--viewport-xs) {
			--chart-aspect-ratio: 1;
		}
	}

	.chart-iq {
		position: relative;
		width: 100%;
		height: var(--chart-height, auto);
		aspect-ratio: var(--chart-aspect-ratio);

		> * {
			position: absolute;
			top: 0;
			bottom: 0;
			left: 0;
			right: 0;
		}

		.overlay {
			z-index: 99;
			pointer-events: none;
		}

		.loading {
			z-index: 100;
			display: flex;
			justify-content: center;
			align-items: center;
		}

		.error {
			padding-top: 2rem;
			padding-inline: calc((100% - min(65ch, 100%)) / 2);
		}
	}
</style>
