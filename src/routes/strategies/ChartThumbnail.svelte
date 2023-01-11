<script lang="ts">
	type Tick = [Date, number];
	export let data: Tick[] = [];
	export let scaleX: any;
	export let scaleY: any;

	const commands = data.map(([date, val], idx) => {
		const type = idx === 0 ? 'M' : 'L';
		return `${type}${scaleX(date)},${scaleY(val)}`;
	});

	const width = Math.max(...scaleX.range());
	const height = Math.max(...scaleY.range());
	const y0 = scaleY(0);
</script>

<svg class="chart-thumbnail" viewBox="0 0 {width} {height}" fill="none" xmlns="http://www.w3.org/2000/svg">
	<line class="x-axis" x1="0" y1={y0} x2={width} y2={y0} />
	<path class="data" d={commands.join(' ')} />
</svg>

<style lang="postcss">
	.chart-thumbnail {
		width: 100%;
		height: 100%;
		background: var(--c-background-7);
	}

	.x-axis {
		stroke: var(--c-text-ultra-light-night);
		stroke-width: 0.5;
	}

	.data {
		stroke: var(--c-text-light-night);
		stroke-width: 3;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
</style>
