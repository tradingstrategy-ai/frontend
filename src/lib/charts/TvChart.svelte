<script module lang="ts">
	import type { DataItem, IChartApi, ISeriesApi, MouseEventParams, Point, SeriesType, Time } from 'lightweight-charts';
	import type { ChartCallback, TvChartOptions } from './types';
	import { getContext, setContext } from 'svelte';

	const contextKey = Symbol();

	const colorProps = [
		'text',
		'textLight',
		'textExtraLight',
		'textUltraLight',
		'textInverted',
		'box1',
		'box2',
		'box3',
		'box4',
		'bullish',
		'bullish0',
		'bullish30',
		'bearish',
		'bearish0',
		'bearish30',
		'neutral',
		'neutral0',
		'neutral30',
		'axisBorder',
		'gridLines',
		'paneSeparator'
	] as const;

	export type ChartColors = Record<(typeof colorProps)[number], string>;

	type ChartContext = {
		chart: IChartApi;
		colors: ChartColors;
	};

	export function getChartContext() {
		return getContext<ChartContext>(contextKey);
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fade } from 'svelte/transition';
	import { MediaQuery } from 'svelte/reactivity';
	import { captureException } from '@sentry/sveltekit';
	import { createChart } from 'lightweight-charts';
	import { getCssColors } from '$lib/helpers/style';
	import Spinner from '$lib/components/Spinner.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';

	type TooltipParams = MouseEventParams<Time>;
	type ActiveTooltipParams = TooltipParams & Required<Pick<TooltipParams, 'time' | 'logical' | 'point' | 'paneIndex'>>;
	type TooltipData = Maybe<DataItem<Time> & Record<string, any>>[];

	type Props = {
		loading?: boolean;
		grid?: boolean;
		crosshairs?: boolean;
		options?: TvChartOptions | ((colors: ChartColors) => TvChartOptions);
		callback?: ChartCallback;
		children?: Snippet;
		tooltip?: Snippet<[ActiveTooltipParams, TooltipData]>;
	};

	// prettier-ignore
	let {
		loading = false,
		grid = false,
		crosshairs = false,
		options,
		callback,
		children,
		tooltip
	}: Props = $props();

	const isMobile = new MediaQuery('width <= 576px');

	// local registry of series that are added to the chart (needed for tooltip data lookup)
	const allSeries: ISeriesApi<SeriesType>[] = [];

	let el: HTMLDivElement | undefined = $state();

	let colors = $derived(el && getCssColors(el, colorProps));

	let chart = $derived.by(() => {
		if (!el || !colors) return undefined;
		const style = getComputedStyle(el);
		const baseOptions = getBaseOptions(style, colors);
		return createChart(el, baseOptions);
	});

	let tooltipParams: TooltipParams = $state({ seriesData: new Map() });

	let resolvedOptions = $derived.by(() => {
		if (options instanceof Function) {
			return colors && options(colors);
		}
		return options;
	});

	function getBaseOptions(style: CSSStyleDeclaration, colors: ChartColors): TvChartOptions {
		return {
			autoSize: true,
			layout: {
				attributionLogo: false,
				background: { color: 'transparent' },
				textColor: colors.text,
				fontFamily: style.fontFamily,
				fontSize: parseInt(style.fontSize),
				panes: {
					separatorColor: colors.paneSeparator,
					separatorHoverColor: colors.box4,
					enableResize: false
				}
			},
			grid: {
				vertLines: {
					color: colors.gridLines,
					visible: grid
				},
				horzLines: {
					color: colors.gridLines,
					visible: grid
				}
			},
			crosshair: {
				vertLine: {
					color: colors.textExtraLight,
					labelBackgroundColor: colors.textUltraLight,
					visible: crosshairs,
					labelVisible: crosshairs
				},
				horzLine: {
					color: colors.textExtraLight,
					labelBackgroundColor: colors.textUltraLight,
					visible: crosshairs,
					labelVisible: crosshairs
				}
			},
			timeScale: {
				borderColor: colors.axisBorder,
				barSpacing: 8
			}
		};
	}

	function isActiveTooltip(params: TooltipParams): params is ActiveTooltipParams {
		return [params.time, params.logical, params.point, params.paneIndex].every((v) => v !== undefined);
	}

	// address multi-pane tooltip positioning bug
	function getCorrectedTooltip(params: ActiveTooltipParams): ActiveTooltipParams {
		const point: Point = { ...params.point };
		const preceedingPanes = chart!.panes().slice(0, params.paneIndex);

		// add preceeding pane heights to point.y (+1 for pane separator)
		preceedingPanes.forEach((pane) => {
			(point as any).y += pane.getHeight() + 1;
		});

		return { ...params, point };
	}

	// apply custom chart options
	$effect(() => {
		if (resolvedOptions) chart?.applyOptions(resolvedOptions);
	});

	// call callback (after chart created and whenever callback is updated)
	// push to event loop to allow series init to complete
	$effect(() => {
		if (chart && callback) {
			setTimeout(() => callback({ chart }));
		}
	});

	// decorate chart.addSeries and chart.removeSeries to add/remove series to/from local registry
	// (to provide deterministic series order back to tooltip)
	$effect(() => {
		if (!chart) return;

		chart.addSeries = function () {
			const series = chart.constructor.prototype.addSeries.apply(chart, arguments);
			allSeries.push(series);
			return series;
		};

		chart.removeSeries = function (series) {
			chart.constructor.prototype.removeSeries.apply(chart, arguments);
			const index = allSeries.indexOf(series);
			if (index !== -1) allSeries.splice(index, 1);
		};
	});

	// toggle visibility of y-axis scale based on screen size (unless visibility is explicitly set)
	$effect(() => {
		const visible = resolvedOptions?.rightPriceScale?.visible ?? !isMobile.current;
		chart?.applyOptions({ rightPriceScale: { visible } });
	});

	// capture tooltip data when hovering over the chart
	$effect(() => {
		const updateTooltip = (params: TooltipParams) => (tooltipParams = params);
		chart?.subscribeCrosshairMove(updateTooltip);
		return () => chart?.unsubscribeCrosshairMove(updateTooltip);
	});

	setContext(contextKey, {
		get chart() {
			return chart;
		},

		get colors() {
			return colors;
		}
	});

	// prevent chart from capturing vertical wheel events so you can still scroll the page
	// use wheel with modifier key pressed (ctrl, alt, meta) to zoom chart
	function handleWheel(event: WheelEvent) {
		const isVertical = Math.abs(event.deltaY) > Math.abs(event.deltaX);
		const modifierPressed = event.ctrlKey || event.altKey || event.metaKey;
		if (isVertical && !modifierPressed) event.stopPropagation();
	}
</script>

<div class="tv-chart" bind:this={el} onwheelcapture={handleWheel} data-css-props data-testid="tv-chart">
	{#if loading}
		<div class="loading" transition:fade={{ duration: 250 }}>
			<Spinner size="60" />
		</div>
	{/if}

	{#if chart && colors}
		<svelte:boundary onerror={(e) => captureException(e)}>
			{@render children?.()}

			{#snippet failed(error)}
				<div class="tv-error">
					<Tooltip>
						<span slot="trigger" class="underline">Error rendering chart series</span>
						<pre slot="popup">{error}</pre>
					</Tooltip>
				</div>
			{/snippet}
		</svelte:boundary>
	{/if}

	{#if tooltip && isActiveTooltip(tooltipParams)}
		{@const adjustedTooltipParams = getCorrectedTooltip(tooltipParams)}
		{@const tooltipData = allSeries.map((s) => tooltipParams.seriesData.get(s))}
		{@render tooltip(adjustedTooltipParams, tooltipData)}
	{/if}
</div>

<style>
	[data-css-props] {
		--chart-aspect-ratio: 16/9;
		--chart-height: auto;

		@media (--viewport-sm-down) {
			--chart-aspect-ratio: 3/2;
		}

		@media (--viewport-xs) {
			--chart-aspect-ratio: 1;
		}
	}

	.tv-chart {
		--c-bullish-0: color-mix(in srgb, transparent, var(--c-bullish) 0.1%);
		--c-bullish-30: color-mix(in srgb, transparent, var(--c-bullish) 30%);
		--c-bearish-0: color-mix(in srgb, transparent, var(--c-bearish) 0.1%);
		--c-bearish-30: color-mix(in srgb, transparent, var(--c-bearish) 30%);
		--c-neutral: var(--c-text-ultra-light);
		--c-neutral-0: color-mix(in srgb, transparent, var(--c-neutral) 0.1%);
		--c-neutral-30: color-mix(in srgb, transparent, var(--c-neutral) 30%);
		--c-axis-border: var(--cm-light, var(--c-text-light)) var(--cm-dark, var(--c-text-extra-light));
		--c-grid-lines: var(--cm-light, var(--c-box-3)) var(--cm-dark, var(--c-box-1));
		--c-pane-separator: var(--cm-light, var(--c-text-extra-light)) var(--cm-dark, var(--c-text-ultra-light));

		position: relative;
		contain: size;
		display: grid;
		width: 100%;
		height: var(--chart-height);
		aspect-ratio: var(--chart-aspect-ratio);
		font: var(--f-ui-sm-roman);

		> :global(*) {
			grid-area: 1 / -1;
		}

		.loading {
			display: grid;
			place-content: center;
			z-index: 100;
		}
	}

	.tv-error {
		margin: 1rem;
		z-index: 5;

		span {
			color: var(--c-error);
			font-weight: 500;
		}

		pre {
			color: var(--c-error);
			white-space: pre-wrap;
		}
	}
</style>
