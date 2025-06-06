<script lang="ts">
	import type { StrategyInfo } from 'trade-executor/models/strategy-info';
	import type { ComponentEvents } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { slide } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { cubicOut } from 'svelte/easing';
	import { PageHeading, Section, SegmentedControl } from '$lib/components';
	import StrategyTile from './StrategyTile.svelte';
	import StrategyTvlChart from './StrategyTvlChart.svelte';
	import { OptionGroup } from '$lib/helpers/option-group.svelte';
	import {
		default as ChainFilter,
		getChainOptions,
		parseChainOption,
		matchesChainOption
	} from 'trade-executor/components/ChainFilter.svelte';
	import { getStrategyChartDateRange } from 'trade-executor/helpers/chart';
	import { getChain } from '$lib/helpers/chain';

	export let data;
	const { admin, strategies, tvlData } = data;

	const chartDateRange = getStrategyChartDateRange(strategies);

	$: ({ searchParams } = $page.url);

	const publicationStatus = new OptionGroup(['all', 'live', 'unpublished'], 'all');
	$: publicationStatus.selected = searchParams.get('publicationStatus');

	function matchesPublicationStatus(strategy: StrategyInfo, status: string) {
		if (!admin || status === 'all') return true;

		// return live strategies for "live" filter; others for "unpublished" filter
		const liveFilter = status === 'live';
		const liveStrategy = strategy.tags?.includes('live');
		return liveFilter === liveStrategy;
	}

	const archiveStatus = new OptionGroup(['current', 'archived'], 'current');
	$: archiveStatus.selected = searchParams.get('archiveStatus');

	function matchesArchiveStatus(strategy: StrategyInfo, status: string) {
		const archivedFilter = status === 'archived';
		const archivedStrategy = strategy.tags?.includes('archived');
		return archivedFilter === archivedStrategy;
	}

	const chainOptions = getChainOptions(strategies);
	$: selectedChain = parseChainOption(chainOptions, searchParams.get('chain'));

	$: filteredStrategies = strategies.filter((s) => {
		return (
			matchesChainOption(s, selectedChain) &&
			matchesPublicationStatus(s, publicationStatus.selected) &&
			matchesArchiveStatus(s, archiveStatus.selected)
		);
	});

	function handleFilterChange({ detail }: ComponentEvents<SegmentedControl>['change']) {
		if (!detail.name) return;

		const newParams = new URLSearchParams(searchParams);
		newParams.set(detail.name, detail.value);
		goto(`?${newParams}`, { replaceState: true, noScroll: true });
	}
</script>

<svelte:head>
	<title>Automated DeFi Strategies | Trading Strategy</title>
	<meta name="description" content="Browse currently available automated DeFi trading strategies" />
</svelte:head>

<main class="strategies-index-page ds-3">
	<Section>
		<PageHeading title="Strategies" description="Currently available automated trading strategies for you" />

		<div class="filters" class:admin>
			<ChainFilter options={chainOptions} selected={selectedChain} on:change={handleFilterChange} />
			<SegmentedControl
				name="archiveStatus"
				options={archiveStatus.options}
				selected={archiveStatus.selected}
				on:change={handleFilterChange}
			/>
			{#if admin}
				<SegmentedControl
					name="publicationStatus"
					options={publicationStatus.options}
					selected={publicationStatus.selected}
					on:change={handleFilterChange}
				/>
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
				No
				{archiveStatus.selected}
				{#if publicationStatus.selected !== 'all'}
					{publicationStatus.selected}
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
		grid-auto-flow: column;
		justify-content: space-between;
		margin-block: -1.5rem 1.75rem;
		text-transform: capitalize;

		@media (--viewport-md-down) {
			margin-block: -1rem 1.5rem;

			:global([data-css-props]) {
				--segmented-control-font: var(--f-ui-xs-medium);
				--segmented-control-letter-spacing: var(--ls-ui-xs);
				--segmented-control-padding: 0.75em 0.875em;
			}
		}

		&.admin {
			@media (--viewport-sm-down) {
				grid-auto-flow: row;
				grid-template-columns: 1fr;
			}
		}

		@media (--viewport-xs) {
			grid-auto-flow: row;
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
