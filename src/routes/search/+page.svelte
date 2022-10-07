<!--
Advanced Search page
- uses (tradingstrategy/search)[https://github.com/tradingstrategy-ai/search] backend
- auto-populates search box with `q` query param if supplied
- returns first 200 matching results (future: pagination or infinite scroll)
-->
<script lang="ts">
	import { page } from '$app/stores';
	import tradingEntities from '$lib/search/trading-entities';
	import FilterPanel from './FilterPanel.svelte';
	import SearchPanel from './SearchPanel.svelte';
	import { sortOptions } from './SortSelect.svelte';

	let q = $page.url.searchParams.get('q') || '';

	let filterPanelOpen = false;
	let filterBy: string[] = [];
	let sortOption = 'liquidity';

	$: hasSearch = filterBy.length > 0 || q.trim().length > 0;

	$: tradingEntities.search({
		q,
		filter_by: filterBy,
		sort_by: sortOptions[sortOption].value,
		facet_by: ['type', 'blockchain', 'exchange'],
		per_page: 200
	});

	function toggleFilterPanel() {
		filterPanelOpen = !filterPanelOpen;
	}
</script>

<svelte:head>
	<title>Token search</title>
	<meta name="description" content="Find best tokens and DEX exchanges" />
</svelte:head>

<main>
	<header class="ds-container">
		<h1>Search</h1>
	</header>

	<section class="ds-container">
		<div class="filter-panel" class:open={filterPanelOpen}>
			<FilterPanel bind:sortOption bind:filterBy facets={$tradingEntities.facets} />
		</div>
		<SearchPanel
			bind:sortOption
			bind:q
			{hasSearch}
			hits={$tradingEntities.hits}
			on:toggleFilterPanel={toggleFilterPanel}
		/>
	</section>
</main>

<style lang="postcss">
	main {
		display: grid;
		gap: 1rem;

		@media (--viewport-md-down) {
			gap: 0.5rem;
		}
	}

	header {
		padding-block: 1.5rem;

		@media (--viewport-md-down) {
			padding-block: 1rem;
		}
	}

	section {
		display: grid;
		grid-template-columns: 20rem 1fr;
		gap: 2.5rem;

		@media (--viewport-md-down) {
			grid-template-columns: 1fr;
		}
	}

	@media (--viewport-md-down) {
		.filter-panel:not(.open) {
			display: none;
		}
	}
</style>
