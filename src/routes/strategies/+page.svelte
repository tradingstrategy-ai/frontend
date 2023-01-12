<script lang="ts">
	import type { PageData } from './$types';
	import { PageHeading } from '$lib/components';
	import StrategyTile from './StrategyTile.svelte';

	export let data: PageData;
	$: strategies = data.strategies;
</script>

<main class="ds-container">
	<PageHeading>
		<h1>Strategies</h1>
		<p>Currently available strategies</p>
	</PageHeading>

	{#if strategies.length}
		<ul>
			{#each strategies as strategy (strategy.id)}
				<StrategyTile {strategy} />
			{/each}
		</ul>
	{:else}
		<p>No strategies configured</p>
	{/if}
</main>

<style>
	h1 {
		margin-top: var(--space-ls);
	}

	ul {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(27.75rem, 90vw, var(--container-max-width)), 1fr));
		gap: var(--strategies-listing-gap, var(--space-xl));
		padding: 0;
	}
</style>
