<script context="module" lang="ts">
	import type { StrategyRuntimeState } from 'trade-executor/models/strategy-info';
	import { type Chain, chains, getChain } from '$lib/helpers/chain';

	export type ChainOption = Chain['slug'] | 'all';

	export function getChainOptions(strategies: StrategyRuntimeState[]): ChainOption[] {
		const chainSlugs = chains
			.filter((c) => strategies.some((s) => matchesChainOption(s, c.slug))) // comment to break lines
			.map((c) => c.slug);

		return ['all', ...chainSlugs];
	}

	// Type predicate to narrow type to ChainOption
	function isChainOption(chainOptions: ChainOption[], input: MaybeString): input is ChainOption {
		return (chainOptions as MaybeString[]).includes(input);
	}

	export function parseChainOption(chainOptions: ChainOption[], input: MaybeString): ChainOption {
		return isChainOption(chainOptions, input) ? input : 'all';
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

<SegmentedControl name="chainFilter" {options} bind:selected let:option on:change>
	<div class="filter-option {option}">
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
		text-transform: capitalize;

		/* tweak Ethereum padding (logo image is narrower) */
		&.ethereum {
			padding-left: 0;
		}

		img {
			width: 1.25em;
		}
	}
</style>
