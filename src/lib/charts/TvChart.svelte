<script module lang="ts">
	import type { DataItem, IChartApi, ISeriesApi, MouseEventParams, Point, SeriesType, Time } from 'lightweight-charts';
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
		'bearish',
		'bullish30',
		'bearish30',
		'axisBorder',
		'gridLines',
		'paneSeparator'
	] as const;

	type Colors = Record<(typeof colorProps)[number], string>;

	type ChartContext = {
		chart: IChartApi;
		colors: Colors;
	};

	export function getChartContext() {
		return getContext<ChartContext>(contextKey);
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fade } from 'svelte/transition';
	import { MediaQuery } from 'svelte/reactivity';
	import { createChart } from 'lightweight-charts';
	import { getCssColors } from '$lib/helpers/style';
	import Spinner from '$lib/components/Spinner.svelte';
	import { formatTokenAmount } from '$lib/helpers/formatters';

	type TooltipParams = MouseEventParams<Time>;
	type ActiveTooltipParams = TooltipParams & Required<Pick<TooltipParams, 'time' | 'logical' | 'point' | 'paneIndex'>>;
	type TooltipData = ((DataItem<Time> & Record<string, any>) | undefined)[];

	type Props = {
		loading?: boolean;
		children?: Snippet;
		tooltip?: Snippet<[ActiveTooltipParams, TooltipData]>;
	};

	let { loading = false, children, tooltip }: Props = $props();

	const isMobile = new MediaQuery('width <= 576px');

	// local registry of series that are added to the chart (needed for tooltip data lookup)
	const allSeries: ISeriesApi<SeriesType>[] = [];

	let el: HTMLDivElement | undefined = $state();

	let colors = $derived(el && getCssColors(el, colorProps));

	let chart = $derived.by(() => {
		if (!el || !colors) return undefined;

		const style = getComputedStyle(el);

		const chart = createChart(el, {
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
				vertLines: { color: colors.gridLines },
				horzLines: { color: colors.gridLines }
			},
			crosshair: {
				vertLine: {
					color: colors.textExtraLight,
					labelBackgroundColor: colors.textUltraLight
				},
				horzLine: {
					color: colors.textExtraLight,
					labelBackgroundColor: colors.textUltraLight
				}
			},
			localization: {
				priceFormatter: (n: number) => formatTokenAmount(n, 1, 2)
			},
			timeScale: {
				borderColor: colors.axisBorder
			}
		});

		// decorate chart.addSeries to add series to local series registry
		chart.addSeries = function () {
			const series = chart.constructor.prototype.addSeries.apply(chart, arguments);
			allSeries.push(series);
			return series;
		};

		// decorate chart.removeSeries to remove series from local series registry
		chart.removeSeries = function (series) {
			chart.constructor.prototype.removeSeries.apply(chart, arguments);
			const index = allSeries.indexOf(series);
			if (index !== -1) allSeries.splice(index, 1);
		};

		return chart;
	});

	let tooltipParams: TooltipParams = $state({ seriesData: new Map() });

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

	// toggle visibility of y-axis scale based on screen size
	// NOTE: may need to make this configirable for future charts
	$effect(() => {
		const visible = !isMobile.current;
		chart?.panes().forEach((p) => p.priceScale('right').applyOptions({ visible }));
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

<div class="tv-chart" bind:this={el} onwheelcapture={handleWheel}>
	{#if loading}
		<div class="loading" transition:fade={{ duration: 250 }}>
			<Spinner size="60" />
		</div>
	{/if}

	{#if chart && colors}
		{@render children?.()}
	{/if}

	{#if tooltip && isActiveTooltip(tooltipParams)}
		{@const adjustedTooltipParams = getCorrectedTooltip(tooltipParams)}
		{@const tooltipData = allSeries.map((s) => tooltipParams.seriesData.get(s))}
		{@render tooltip(adjustedTooltipParams, tooltipData)}
	{/if}
</div>

<style>
	.tv-chart {
		--c-bullish-30: hsl(from var(--c-bullish) h s l / 30%);
		--c-bearish-30: hsl(from var(--c-bearish) h s l / 30%);
		--c-axis-border: var(--cm-light, var(--c-text-light)) var(--cm-dark, var(--c-text-extra-light));
		--c-grid-lines: var(--cm-light, var(--c-box-3)) var(--cm-dark, var(--c-box-1));
		--c-pane-separator: var(--cm-light, var(--c-text-extra-light)) var(--cm-dark, var(--c-text-ultra-light));

		position: relative;
		contain: size;
		display: grid;
		aspect-ratio: 16/9;
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
</style>
