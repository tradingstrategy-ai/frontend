<!--
Advanced Search page
- uses (tradingstrategy/search)[https://github.com/tradingstrategy-ai/search] backend
- auto-populates search options from URL parameters (q, sortBy, filters)
- returns first 200 matching results (future: pagination or infinite scroll)
-->
<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import tradingEntities from '$lib/search/trading-entities';
	import FilterPanel from './FilterPanel.svelte';
	import SearchPanel from './SearchPanel.svelte';
	import { getSortParams } from './SortSelect.svelte';

	const params = $page.url.searchParams;

	let q = params.get('q') || '';
	let sortBy = params.get('sortBy');
	let filters = parseFilters(params.get('filters'));
	let filterBy: string[] = [];
	let filterPanelOpen = false;
	let debounceTimerId: number;

	// deserialize filters URL param
	function parseFilters(filtersJSON: string) {
		try {
			const parsed = JSON.parse(filtersJSON);
			return parsed.constructor === Object ? parsed : {};
		} catch (e) {
			return {};
		}
	}

	// serialize search params to URL; debounce invocations to minimize lag on mobile
	function updateUrlParams(params: Record<string, string>) {
		clearTimeout(debounceTimerId);
		debounceTimerId = setTimeout(() => {
			goto('?' + new URLSearchParams(params), {
				replaceState: true,
				noScroll: true,
				keepFocus: true
			});
		}, 500);
	}

	$: hasSearch = filterBy.length > 0 || q.trim().length > 0;

	$: browser && updateUrlParams({ q, sortBy, filters: JSON.stringify(filters) });

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
		<FilterPanel bind:open={filterPanelOpen} bind:sortBy bind:filters bind:filterBy facets={$tradingEntities.facets} />
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
		gap: var(--space-md);

		@media (--viewport-md-down) {
			gap: var(--space-ss);
		}
	}

	header {
		padding-block: var(--space-lg);

		@media (--viewport-md-down) {
			padding-block: var(--space-md);
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
