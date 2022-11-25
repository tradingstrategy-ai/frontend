<script>
	import StrategyTile from '$lib/components/StrategyTile.svelte';
</script>

<ul class="strategies-listing">
	<StrategyTile isProfitable />
	<StrategyTile isLossy />
	<StrategyTile isProfitable />
	<StrategyTile isLossy />
	<StrategyTile isProfitable />
	<StrategyTile isProfitable />
	<StrategyTile isProfitable />
	<StrategyTile isLossy />
</ul>

<style>
	.strategies-listing {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(27.75rem, 90vw, var(--container-max-width)), auto));
		gap: var(--strategies-listing-gap, 2rem);
		padding: 0;
	}
</style>
