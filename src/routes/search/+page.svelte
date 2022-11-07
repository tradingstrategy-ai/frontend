<!--
Advanced Search page
- uses (tradingstrategy/search)[https://github.com/tradingstrategy-ai/search] backend
- auto-populates search box with `q` query param if supplied
- returns first 200 matching results (future: pagination or infinite scroll)
-->
<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import tradingEntities from '$lib/search/trading-entities';
	import FilterPanel from './FilterPanel.svelte';
	import SearchPanel from './SearchPanel.svelte';
	import { getSortParams } from './SortSelect.svelte';

	const params = $page.url.searchParams;

	let q = params.get('q') || '';
	let sortBy = params.get('sortBy');
	let filterBy: string[] = [];
	let filterPanelOpen = false;

	function updateUrl(params: Record<string, string>) {
		browser && history.replaceState(null, '', '?' + new URLSearchParams(params));
	}

	$: hasSearch = filterBy.length > 0 || q.trim().length > 0;

	$: updateUrl({ q, sortBy });

	$: tradingEntities.search({
		q,
		filter_by: filterBy,
		sort_by: getSortParams(sortBy),
		facet_by: ['type', 'blockchain', 'exchange'],
		per_page: 200
	});
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
		<FilterPanel bind:open={filterPanelOpen} bind:sortBy bind:filterBy facets={$tradingEntities.facets} />
		<SearchPanel
			bind:sortBy
			bind:q
			{hasSearch}
			hits={$tradingEntities.hits}
			on:showFilters={() => (filterPanelOpen = true)}
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
</style>
