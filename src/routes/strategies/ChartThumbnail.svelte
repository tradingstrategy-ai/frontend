<script context="module" lang="ts">
	export type ChartTick = [Date, number | undefined];
</script>

<script lang="ts">
	import { roundUTCDate } from '$lib/helpers/date';

	export let data: ChartTick[] = [];
	export let active: ChartTick | undefined;
	export let scaleX: any;
	export let scaleY: any;

	const commands = data.map(([date, val], idx) => {
		const type = idx === 0 ? 'M' : 'L';
		return `${type}${scaleX(date)},${scaleY(val)}`;
	});

	const width = Math.max(...scaleX.range());
	const height = Math.max(...scaleY.range());
	const y0 = scaleY(0);

	function handleMouseMove({ currentTarget, clientX, clientY }) {
		const screenPoint = new DOMPointReadOnly(clientX, clientY);
		const svgPoint = screenPoint.matrixTransform(currentTarget.getScreenCTM().inverse());
		const date = roundUTCDate(scaleX.invert(svgPoint.x));
		active = data.find(([d]) => d.valueOf() === date.valueOf()) || [date, undefined];
	}
</script>

<svg
	class="chart-thumbnail"
	viewBox="0 0 {width} {height}"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
	on:mousemove={handleMouseMove}
>
	<line class="x-axis" x1="0" y1={y0} x2={width} y2={y0} />
	<path class="data" d={commands.join(' ')} />
	{#if active}
		{@const x = scaleX(active[0])}
		<line class="crosshair" x1={x} y1={-height} x2={x} y2={height * 2} />
	{/if}
</svg>

<style lang="postcss">
	.chart-thumbnail {
		width: 100%;
		height: 100%;
		background: var(--c-background-7);

		& .x-axis {
			stroke: var(--c-text-ultra-light-night);
			stroke-width: 1;
		}

		& .crosshair {
			stroke: var(--c-text-ultra-light-night);
			stroke-width: 1;
			stroke-dasharray: 6;
		}

		&:not(:hover) .crosshair {
			display: none;
		}

		& .data {
			stroke: var(--c-text-light-night);
			stroke-width: 3;
			stroke-linecap: round;
			stroke-linejoin: round;
		}
	}
</style>
