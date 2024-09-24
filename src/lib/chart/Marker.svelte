<script lang="ts">
	export let x: MaybeNumber;
	export let y: MaybeNumber;
	export let size = 5;
</script>

<svg class="chart-marker">
	{#if [x, y].every(Number.isFinite)}
		<circle cx={x} cy={y} r={size} />
	{/if}
</svg>

<style>
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
