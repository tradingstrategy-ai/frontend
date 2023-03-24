<script lang="ts">
	export let x: number | undefined;
	export let y: number | undefined;
	export let size: number = 5;
</script>

<svg class="chart-marker">
	{#if x !== undefined && y !== undefined}
		<circle cx={x} cy={y} r={size} />
	{/if}
</svg>

<style lang="postcss">
	.chart-marker {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
	}

	circle {
		fill: var(--marker-color, currentColor);
	}
</style>
