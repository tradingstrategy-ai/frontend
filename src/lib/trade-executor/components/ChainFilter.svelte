<script lang="ts">
	import type { StrategyRuntimeState } from 'trade-executor/strategy/runtime-state';
	import SegmentedControl from '$lib/components/SegmentedControl.svelte';
	import { type Chain, chains, getChain } from '$lib/helpers/chain';
	import { getLogoUrl } from '$lib/helpers/assets';

	export let strategies: StrategyRuntimeState[];
	export let filteredStrategies = strategies;
	export let selected: Chain['slug'] | 'all' = 'all';

	const chainSlugs = chains
		.filter((c) => strategies.some((s) => matches(s, c))) // comment to break lines
		.map((c) => c.slug);

	const options = ['all', ...chainSlugs];

	$: selectedChain = getChain(selected);

	$: filteredStrategies = strategies.filter((s) => matches(s, selectedChain));

	function matches(strategy: StrategyRuntimeState, chain?: Chain) {
		if (chain === undefined) return true;
		return strategy.on_chain_data?.chain_id === chain.id;
	}
</script>

<SegmentedControl {options} bind:selected let:option>
	<div class="filter-option">
		{#if getChain(option)}
			<img class="chain-icon" src={getLogoUrl('blockchain', option)} alt={option} />
		{/if}
		<span>{option}</span>
	</div>
</SegmentedControl>

<style>
	.filter-option {
		display: inline-flex;
		gap: 0.25rem;
		align-items: center;
		justify-content: center;
		min-width: 7rem;

		img {
			width: 1.25rem;
		}

		span {
			text-transform: capitalize;
		}
	}
</style>
