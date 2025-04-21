<script lang="ts">
	import type { Point } from 'lightweight-charts';
	import type { Snippet } from 'svelte';
	import { getChartContext } from './TvChart.svelte';

	const { chart } = getChartContext();

	type Props = {
		point: Point;
		children: Snippet;
	};

	let { point, children }: Props = $props();

	let width = $state(0);

	let flipX = $derived(width + point.x > chart.paneSize().width);

	let mounted = $state(false);

	// enable transitions only after initial render (to prevent FOUC in multi-pane charts)
	$effect(() => {
		setTimeout(() => (mounted = true), 0);
	});
</script>

<div
	class={['chart-tooltip', mounted && 'transition-enabled', flipX && 'flip-x']}
	style:--x="{point.x}px"
	style:--y="{point.y}px"
	bind:offsetWidth={width}
>
	{@render children()}
</div>

<style>
	.chart-tooltip {
		position: absolute;
		top: var(--y);
		left: var(--x);
		z-index: 3;
		padding: 1.125rem;
		border-radius: var(--radius-md);
		background: color-mix(in srgb, transparent, var(--c-text-inverted) 80%);
		box-shadow: var(--shadow-3);
		white-space: nowrap;
		pointer-events: none;
		transform: translateX(var(--translate-x));
		--margin-x: 0.75rem;
		--translate-x: var(--margin-x);

		&.flip-x {
			--translate-x: calc(-100% - var(--margin-x));
		}

		&.transition-enabled {
			transition: transform var(--time-md) ease-in-out;
		}
	}
</style>
