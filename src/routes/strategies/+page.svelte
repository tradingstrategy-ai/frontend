<script lang="ts">
	import type { StrategyRuntimeState } from 'trade-executor/models/strategy-info';
	import type { ComponentEvents } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { slide } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { cubicOut } from 'svelte/easing';
	import { PageHeading, Section, SegmentedControl } from '$lib/components';
	import StrategyTile from './StrategyTile.svelte';
	import StrategyTvlChart from './StrategyTvlChart.svelte';
	import {
		default as ChainFilter,
		getChainOptions,
		parseChainOption,
		matchesChainOption
	} from 'trade-executor/components/ChainFilter.svelte';
	import { getStrategyChartDateRange } from 'trade-executor/chart/helpers';
	import { getChain } from '$lib/helpers/chain';

	export let data;
	const { admin, strategies, tvlData } = data;

	const chartDateRange = getStrategyChartDateRange(strategies);

	type StatusOption = (typeof statusOptions)[number];
	const statusOptions = ['all', 'live', 'unpublished'] as const;
	let selectedStatus: StatusOption = 'all';

	const chainOptions = getChainOptions(strategies);
	$: selectedChain = parseChainOption(chainOptions, $page.url.searchParams.get('chainFilter'));

	$: filteredStrategies = strategies.filter((s) => {
		return matchesStatus(s, selectedStatus) && matchesChainOption(s, selectedChain);
	});

	function matchesStatus(strategy: StrategyRuntimeState, status: StatusOption) {
		if (!admin || status === 'all') return true;

		// return live strategies for "live" filter; others for "unpublished" filter
		const liveFilter = status === 'live';
		const liveStrategy = strategy.tags?.includes('live');
		return liveFilter === liveStrategy;
	}

	function handleChainFilterChange({ detail }: ComponentEvents<ChainFilter>['change']) {
		goto(`?chainFilter=${detail.value}`, { replaceState: true, noScroll: true });
	}
</script>

<svelte:head>
	<title>Automated DeFi Strategies | Trading Strategy</title>
	<meta name="description" content="Browse currently available automated DeFi trading strategies" />
</svelte:head>

<main class="strategies-index-page ds-3">
	<Section>
		<PageHeading title="Strategies" description="Currently available automated trading strategies for you" />

		<div class="filters">
			<ChainFilter options={chainOptions} selected={selectedChain} on:change={handleChainFilterChange} />
			{#if admin}
				<SegmentedControl bind:selected={selectedStatus} options={statusOptions} />
			{/if}
		</div>

		{#if filteredStrategies.length}
			<div class="strategy-tiles" data-testid="strategy-tiles">
				{#each filteredStrategies as strategy, idx (strategy.id)}
					{@const params = { duration: 200, delay: 50 * idx, easing: cubicOut }}
					<div transition:slide={{ axis: 'x', ...params }} animate:flip={params} style:display="grid">
						<StrategyTile {admin} {strategy} {chartDateRange} />
					</div>
				{/each}
			</div>
		{:else}
			<p>
				Currently no
				{#if selectedStatus !== 'all'}
					{selectedStatus}
				{/if}
				{#if selectedChain !== 'all'}
					{getChain(selectedChain)?.name}
				{/if}
				strategies available.
			</p>

			<p>
				<a class="body-link" href="/community">Join Discord to get access</a>.
			</p>
		{/if}
	</Section>

	{#if admin}
		<Section>
			<StrategyTvlChart {tvlData} />
		</Section>
	{/if}
</main>

<style>
	.strategies-index-page {
		display: grid;
		gap: 3rem;
		margin-top: 1.25rem;
	}

	.filters {
		display: grid;
		gap: 0.75rem 1rem;
		grid-template-columns: auto auto;
		justify-content: space-between;
		margin-block: -1.5rem 1.75rem;
		text-transform: capitalize;

		@media (--viewport-md-down) {
			margin-block: -1rem 1.5rem;
		}

		@media (--viewport-sm-down) {
			grid-template-columns: 1fr;
		}

		@media (--viewport-xs) {
			margin-block: -0.75rem 1.25rem;
		}
	}

	.strategy-tiles {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;

		@media (--viewport-md-down) {
			grid-template-columns: 1fr;
		}
	}
</style>
