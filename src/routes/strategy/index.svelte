<script context="module">
	import { getConfiguredStrategies } from 'trade-executor-frontend/strategy/configuration';
	import { getStrategiesWithMetadata } from 'trade-executor-frontend/strategy/metadata';

	export async function load({ fetch }) {
		let strategies = await getStrategiesWithMetadata(fetch);

		// Laod metadata from all strategies
		return {
			props: {
				strategies
			}
		};
	}
</script>

<script lang="ts">
	import StrategyOverview from 'trade-executor-frontend/strategy/StrategyOverview.svelte';

	export let strategies;
</script>

<div class="container">
	{#if strategies.length > 0}
		<h1>Trading strategies</h1>

		<p>Currently running trading strategies.</p>

		<div class="card-deck">
			{#each strategies as strategy}
				<StrategyOverview {strategy} />
			{/each}
		</div>
	{:else}
		<p>No strategies configured</p>
	{/if}
</div>
