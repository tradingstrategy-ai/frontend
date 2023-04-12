<script lang="ts">
	import { scaleLinear, scaleUtc } from 'd3-scale';
	import { extent } from 'd3-array';
	import { fromUnixTime } from 'date-fns';
	import { determinePriceChangeClass } from '$lib/helpers/price';
	import { draw } from 'svelte/transition';

	type ChartTick = [Date, number];

	export let equityData: [number, number][] = [];
	export let showLine = false;

	const equityTicks: ChartTick[] = equityData.map(([d, v]) => [fromUnixTime(d), v]);

	const width = 500;
	const height = 300;
	const scaleX = scaleUtc([equityTicks[0][0], equityTicks.at(-1)[0]], [0, width]);
	const scaleY = scaleLinear(getValueRange(equityTicks), [height, 0]);
	const y0 = scaleY(0);

	const profitClass = determinePriceChangeClass(equityData.at(-1)?.[1]);

	function getValueRange(data: ChartTick[]) {
		const range = extent(data, (tick: ChartTick) => tick[1]);
		return range.every(Number.isFinite) ? range : [0, 0];
	}

	function getPathCommands(data: ChartTick[]) {
		const commands = data.map(([date, val]) => {
			return `L${scaleX(date)},${scaleY(val)}`;
		});
		commands.unshift(`M0,${y0}`);
		return commands.join(' ');
	}
</script>

<div class="chart-thumbnail">
	<svg viewBox="0 0 {width} {height}" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
		{#if showLine}
			<path class="data {profitClass}" d={getPathCommands(equityTicks)} in:draw={{ duration: 5000 }} />
		{/if}

		<line class="x-axis" x1="0" y1={y0} x2={width} y2={y0} />
	</svg>
</div>

<style lang="postcss">
	.chart-thumbnail {
		height: 100%;
		overflow: hidden;
		display: grid;
		grid-template-rows: 3rem 1fr 3rem;
		background: var(--c-background-7);
		user-select: none;

		& svg {
			grid-row: 2;
			width: 100%;
			height: 100%;
			overflow: visible;
		}

		& .x-axis {
			stroke: var(--c-text-ultra-light-night);
			stroke-width: 0.5;
		}

		& .data {
			stroke: var(--c-text-light-night);
			stroke-width: 1;
			stroke-linejoin: round;

			&.bullish {
				stroke: hsla(var(--hsl-bullish));
			}

			&.bearish {
				stroke: hsla(var(--hsl-bearish));
			}
		}
	}
</style>
