<script lang="ts">
	import type { StrategyMetadata } from 'trade-executor-frontend/strategy/metadata';
	import { StrategyTile } from '$lib/components';

	export let strategies: StrategyMetadata[];
</script>

<ul>
	{#each strategies as { id, name, short_description, error } (id)}
		<StrategyTile {id} {name} description={short_description} {error} />
	{/each}
</ul>

<style>
	ul {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(27.75rem, 90vw, var(--container-max-width)), auto));
		gap: var(--strategies-listing-gap, 2rem);
		padding: 0;
	}
</style>
