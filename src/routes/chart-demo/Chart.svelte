<script lang="ts">
	import { scaleLinear, scaleUtc } from 'd3-scale';
	import { extent } from 'd3-array';
	import { fromUnixTime } from 'date-fns';
	import { determinePriceChangeClass } from '$lib/helpers/price';
	import { draw } from 'svelte/transition';

	type ChartData = [number, number];
	type ChartTick = [Date, number];

	export let equityData: ChartData[];
	export let buyHoldData: ChartData[];
	export let showLines = false;

	const equityTicks: ChartTick[] = equityData.map(([d, v]) => [fromUnixTime(d), v]);
	const buyHoldTicks: ChartTick[] = buyHoldData.map(([d, v]) => [fromUnixTime(d), v]);

	const width = 1200;
	const height = 600;

	const scaleX = scaleUtc([equityTicks[0][0], equityTicks.at(-1)[0]], [0, width]);
	const scaleY = scaleLinear(getValueRange([...equityData, ...buyHoldData]), [height, 0]).nice();
	const y0 = scaleY(0);

	const xFormat = scaleX.tickFormat();
	const yFormat = scaleY.tickFormat(null, '$,f');

	const profitClass = determinePriceChangeClass(equityData.at(-1)?.[1]);

	function getValueRange(data: ChartData[]) {
		return extent(data, (item: ChartData) => item[1]);
	}

	function getPathCommands(data: ChartTick[]) {
		const commands = data.map(([date, val], idx) => {
			return `${idx ? 'L' : 'M'}${scaleX(date)},${scaleY(val)}`;
		});
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
	{#if showLines}
		<path class="data equity" d={getPathCommands(equityTicks)} in:draw={{ duration: 5000 }} />
		<path class="data buyHold" d={getPathCommands(buyHoldTicks)} in:draw={{ duration: 5000 }} />
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

			&.equity {
				stroke: hsla(var(--hsl-bullish));
			}

			&.buyHold {
				stroke: hsla(var(--hsl-text-ultra-light));
			}
		}
	}
</style>
