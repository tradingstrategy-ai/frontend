<script lang="ts">
	import type { StrategyMetadata } from 'trade-executor-frontend/strategy/metadata';
	import StrategyTile from './StrategyTile.svelte';

	export let strategies: StrategyMetadata[];
</script>

<ul>
	{#each strategies as strategy (strategy.id)}
		<StrategyTile {strategy} />
	{/each}
</ul>

<style>
	ul {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(27.75rem, 90vw, var(--container-max-width)), 1fr));
		gap: var(--strategies-listing-gap, 2rem);
		padding: 0;
	}
</style>
