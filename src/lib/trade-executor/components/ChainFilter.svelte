<script lang="ts">
	import type { StrategyRuntimeState } from 'trade-executor/strategy/runtime-state';
	import { type Chain, getChain } from '$lib/helpers/chain';
	import SegmentedControl from '$lib/components/SegmentedControl.svelte';
	import { getLogoUrl } from '$lib/helpers/assets';

	export let strategies: StrategyRuntimeState[];
	export let filteredStrategies = strategies;
	export let selected: Chain['slug'] | 'all' = 'all';

	const options = ['all'];

	strategies.forEach((s) => {
		const option = getChainSlug(s);
		if (option && !options.includes(option)) options.push(option);
	});

	$: filteredStrategies = strategies.filter((s) => selected === 'all' || getChainSlug(s) === selected);

	function getChainSlug({ on_chain_data }: StrategyRuntimeState) {
		return getChain(on_chain_data?.chain_id)?.slug;
	}
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
