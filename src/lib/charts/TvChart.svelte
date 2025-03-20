<script module lang="ts">
	import type { IChartApi } from 'lightweight-charts';
	import { getContext, setContext } from 'svelte';

	const key = Symbol();

	type ChartContext = () => IChartApi | undefined;

	export function getChartContext() {
		return getContext<ChartContext>(key);
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { createChart } from 'lightweight-charts';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();

	let el: HTMLDivElement | undefined = $state();

	let chart = $derived(el && createChart(el));

	setContext(key, () => chart);

	// prevent chart from capturing vertical wheel events so you can still scroll the page
	// use wheel with modifier key pressed (ctrl, alt, meta) to zoom chart
	function handleWheel(event: WheelEvent) {
		const isVertical = Math.abs(event.deltaY) > Math.abs(event.deltaX);
		const modifierPressed = event.ctrlKey || event.altKey || event.metaKey;
		if (isVertical && !modifierPressed) event.stopPropagation();
	}
</script>

<div class="tv-chart" bind:this={el} onwheelcapture={handleWheel}>
	{@render children()}
</div>

<style>
	.tv-chart {
		aspect-ratio: 16/9;
	}
</style>
