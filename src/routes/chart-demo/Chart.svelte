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

	const width = 1200;
	const height = 600;

	const scaleX = scaleUtc([equityTicks[0][0], equityTicks.at(-1)[0]], [0, width]);
	const scaleY = scaleLinear(getValueRange(equityTicks), [height, 0]).nice();
	const y0 = scaleY(0);

	const xFormat = scaleX.tickFormat();
	const yFormat = scaleY.tickFormat(null, '$,f');

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

<svg
	class="chart"
	viewBox="0 0 {width + 100} {height + 40}"
	preserveAspectRatio="none"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
>
	{#if showLine}
		<path class="data {profitClass}" d={getPathCommands(equityTicks)} in:draw={{ duration: 5000 }} />
	{/if}

	<!-- x axis line and labels -->
	<line class="axis" x1="0" y1={height} x2={width} y2={height} />
	{#each scaleX.ticks() as tick}
		{@const x = scaleX(tick)}
		<line class="grid" x1={x} x2={x} y1={0} y2={height} />
		<text {x} y={height + 25} text-anchor="middle">{xFormat(tick)}</text>
	{/each}

	<!-- y axis line and labels -->
	<line class="axis" x1={0} x2={1} y1={0} y2={height} />
	<line class="axis" x1={width} x2={width} y1={0} y2={height} />
	{#each scaleY.ticks() as tick}
		{@const y = scaleY(tick)}
		<line class="grid" x1={0} x2={width} y1={y} y2={y} />
		<text x={width + 10} y={y + 2} text-anchor="start">{yFormat(tick)}</text>
	{/each}
</svg>

<style lang="postcss">
	.chart {
		user-select: none;
		overflow: visible;

		& .axis {
			stroke: hsla(var(--hsl-box), var(--a-box-e));
			stroke-width: 1;
		}

		& .grid {
			stroke: hsla(var(--hsl-box), var(--a-box-b));
			stroke-width: 0.5;
		}

		& text {
			font: var(--f-ui-xs-roman);
			fill: currentColor;
		}

		& .data {
			stroke: hsla(var(--hsl-text-extra-light));
			stroke-width: 2;
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
