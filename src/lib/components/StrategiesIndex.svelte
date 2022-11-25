<script>
	import StrategyTile from '$lib/components/StrategyTile.svelte';
</script>

<ul class="strategies-index">
	<StrategyTile />
	<StrategyTile />
	<StrategyTile />
	<StrategyTile />
</ul>

<style>
	.strategies-index {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(34rem, 90vw, var(--container-max-width)), auto));
		gap: var(--strategies-index-gap, 2rem);
		padding: 0;
	}
</style>
