<script lang="ts">
	import { PageHeading } from '$lib/components';
	import StrategyTile from './StrategyTile.svelte';

	export let data;
	$: ({ strategies, chainInfo } = data);
</script>

<svelte:head>
	<title>Automated DeFi Strategies | Trading Strategy</title>
	<meta name="description" content="Browse currently available automated DeFi trading strategies" />
</svelte:head>

<main class="ds-container strategies-index-page">
	<PageHeading title="Strategies" description="Currently available strategies" />

	{#if strategies.length}
		<ul>
			{#each strategies as strategy (strategy.id)}
				<StrategyTile {strategy} chain={chainInfo[strategy.on_chain_data?.chain_id]} />
			{/each}
		</ul>
	{:else}
		<p>No strategies configured</p>
	{/if}
</main>

<style>
	.strategies-index-page {
		margin-top: var(--space-ls);
	}

	ul {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(27.75rem, 90vw, var(--container-max-width)), 1fr));
		gap: var(--strategies-listing-gap, var(--space-xl));
		padding: 0;
	}
</style>
