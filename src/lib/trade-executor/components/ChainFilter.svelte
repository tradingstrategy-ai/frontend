<script context="module" lang="ts">
	import type { StrategyRuntimeState } from 'trade-executor/strategy/runtime-state';
	import { type Chain, chains, getChain } from '$lib/helpers/chain';

	export type ChainOption = Chain['slug'] | 'all';

	export function getChainOptions(strategies: StrategyRuntimeState[]): ChainOption[] {
		const chainSlugs = chains
			.filter((c) => strategies.some((s) => matchesChainOption(s, c.slug))) // comment to break lines
			.map((c) => c.slug);

		return ['all', ...chainSlugs];
	}

	export function matchesChainOption(strategy: StrategyRuntimeState, chainOption?: ChainOption) {
		if (chainOption === 'all') return true;
		const chain = getChain(chainOption);
		return strategy.on_chain_data?.chain_id === chain?.id;
	}
</script>

<script lang="ts">
	import SegmentedControl from '$lib/components/SegmentedControl.svelte';
	import { getLogoUrl } from '$lib/helpers/assets';

	export let options: ChainOption[];
	export let selected: ChainOption;
</script>

<SegmentedControl {options} bind:selected let:option>
	<div class="filter-option">
		{#if option !== 'all'}
			<img class="chain-icon" src={getLogoUrl('blockchain', option)} alt={option} />
		{/if}
		<span>{option}</span>
	</div>
</SegmentedControl>

<style>
	.filter-option {
		display: flex;
		gap: 0.25rem;
		align-items: center;
		justify-content: center;
		padding-inline: 0.25rem;

		img {
			width: 1.25em;
		}

		span {
			text-transform: capitalize;
		}
	}
</style>
