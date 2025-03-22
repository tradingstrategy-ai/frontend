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
		'bearish30'
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

	type Props = {
		loading?: boolean;
		children?: Snippet;
	};

	let { loading = false, children }: Props = $props();

	let el: HTMLDivElement | undefined = $state();

	let colors = $derived(el && getCssColors(el, colorProps));

	let chart = $derived.by(() => {
		if (!el || !colors) return undefined;

		return createChart(el, {
			layout: {
				background: { color: 'transparent' },
				textColor: colors.text,
				fontFamily: '"Neue Haas Grotesk Text", system-ui, sans-serif',
				fontSize: 14
			},
			grid: {
				vertLines: { color: colors.box3 },
				horzLines: { color: colors.box3 }
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
			}
		});
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
		display: grid;
		aspect-ratio: 16/9;

		> :global(*) {
			grid-area: 1 / -1;
		}

		.loading {
			display: grid;
			place-content: center;
			z-index: 100;
		}

		--c-bullish-30: hsl(from var(--c-bullish) h s l / 30%);
		--c-bearish-30: hsl(from var(--c-bearish) h s l / 30%);
	}
</style>
