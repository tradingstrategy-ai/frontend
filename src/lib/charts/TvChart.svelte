<script module lang="ts">
	import type { IChartApi } from 'lightweight-charts';
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
	import { createChart } from 'lightweight-charts';
	import { getCssColors } from '$lib/helpers/style';
	import Spinner from '$lib/components/Spinner.svelte';
	import { formatTokenAmount } from '$lib/helpers/formatters';

	type Props = {
		loading?: boolean;
		children?: Snippet;
	};

	let { loading = false, children }: Props = $props();

	let el: HTMLDivElement | undefined = $state();

	let colors = $derived(el && getCssColors(el, colorProps));

	let chart = $derived.by(() => {
		if (!el || !colors) return undefined;

		const style = getComputedStyle(el);

		const chart = createChart(el, {
			layout: {
				background: { color: 'transparent' },
				textColor: colors.text,
				fontFamily: style.fontFamily,
				fontSize: parseInt(style.fontSize),
				panes: {
					separatorColor: colors.paneSeparator,
					separatorHoverColor: colors.box4
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
			}
		});

		chart.timeScale().applyOptions({
			borderColor: colors.axisBorder
		});

		return chart;
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
</div>

<style>
	.tv-chart {
		--c-bullish-30: hsl(from var(--c-bullish) h s l / 30%);
		--c-bearish-30: hsl(from var(--c-bearish) h s l / 30%);
		--c-axis-border: var(--cm-light, var(--c-text-light)) var(--cm-dark, var(--c-text-extra-light));
		--c-grid-lines: var(--cm-light, var(--c-box-3)) var(--cm-dark, var(--c-box-1));
		--c-pane-separator: var(--cm-light, var(--c-text-extra-light)) var(--cm-dark, var(--c-text-ultra-light));

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
