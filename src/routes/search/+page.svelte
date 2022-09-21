<!--
Advanced Search page
- uses (tradingstrategy/search)[https://github.com/tradingstrategy-ai/search] backend
- auto-populates search box with `q` query param if supplied
- returns first 200 matching results (future: pagination or infinite scroll)
-->
<script lang="ts">
	import { page } from '$app/stores';
	import { formatDollar } from '$lib/helpers/formatters';
	import tradingEntities from '$lib/search/trading-entities';
	import { TextInput } from '$lib/components';
	import SortSelect, { sortOptions } from './SortSelect.svelte';
	import FacetFilter from './FacetFilter.svelte';
	import RangeFilter from './RangeFilter.svelte';
	import NumericFilter from './NumericFilter.svelte';
	import TradingEntityHit from '$lib/search/TradingEntityHit.svelte';

	let q = $page.url.searchParams.get('q') || '';

	let isOpen = true;
	let filters = {},
		filterVals = {},
		filter_by = [];
	let sortOption = 'liquidity';

	$: filter_by = Object.values(filterVals).filter((v) => v);
	$: hasSearch = filter_by.length > 0 || q.trim().length > 0;
	$: tradingEntities.search({
		q,
		filter_by,
		sort_by: sortOptions[sortOption].value,
		facet_by: ['type', 'blockchain', 'exchange'],
		per_page: 200
	});

	function handleFilterChange({ detail }) {
		filterVals[detail.fieldName] = detail.filter;
	}

	function clearAllFilters() {
		for (const name in filters) {
			filters[name] = [];
		}
	}
</script>

<svelte:head>
	<title>Token search</title>
	<meta name="description" content="Find best tokens and DEX exchanges" />
</svelte:head>

<main>
	<section>
		<div class="ds-container">
			<div class="row my-3 my-md-0">
				<div class="col-md-3 d-none d-md-block">
					<h1>Search</h1>
				</div>
				<div class="search-box col-md-9 d-flex align-items-center">
					<TextInput
						size="xl"
						type="search"
						data-cy="search"
						placeholder="Search"
						autocapitalize="none"
						spellcheck="false"
						bind:value={q}
						on:focus={() => (isOpen = true)}
					/>
					<SortSelect class="d-none d-md-block" bind:value={sortOption} />
					<button class:isOpen class="close-filters d-md-none" on:click={() => (isOpen = false)}>Done</button>
				</div>
			</div>

			<div class="row mt-1">
				<div class:isOpen class="filters col-md-3">
					<div class="row  mb-3">
						<div class="col-6 col-md-12">
							<button class="clear-filters" disabled={filter_by.length === 0} on:click={clearAllFilters}>
								{filter_by.length === 0 ? 'Select filters' : '× Clear filters'}
							</button>
						</div>
						<div class="col-6 d-md-none d-flex align-items-center">
							<h2>Sort by:</h2>
							<SortSelect bind:value={sortOption} />
						</div>
					</div>
					<div class="row">
						<div class="col-6 col-md-12">
							{#each $tradingEntities.facets as { field_name, counts } (field_name)}
								<FacetFilter
									bind:selected={filters[field_name]}
									fieldName={field_name}
									options={counts}
									on:change={handleFilterChange}
								/>
							{/each}
						</div>
						<div class="col-6 col-md-12">
							<RangeFilter
								bind:selected={filters['volume_24h']}
								fieldName="volume_24h"
								breakpoints={[Infinity, 1_000_000, 50_000, 0]}
								formatter={(v) => formatDollar(v, 0, 0)}
								on:change={handleFilterChange}
							/>
							<RangeFilter
								bind:selected={filters['liquidity']}
								fieldName="liquidity"
								breakpoints={[Infinity, 5_000_000, 500_000, 0]}
								formatter={(v) => formatDollar(v, 0, 0)}
								on:change={handleFilterChange}
							/>
							<NumericFilter
								bind:selected={filters['price_change_24h']}
								fieldName="price_change_24h"
								filters={['>0.05', '>0', '<0', '<-0.05']}
								labels={['▲ Up > 5%', '△ Up', '▽ Down', '▼ Down > 5%']}
								on:change={handleFilterChange}
							/>
						</div>
					</div>
				</div>
				<div class="results col-md-9 col-sm-12">
					{#if hasSearch}
						<ul>
							{#each $tradingEntities.hits as { document } (document.id)}
								<TradingEntityHit {document} layout="advanced" />
							{/each}
						</ul>
					{:else}
						<div>Search exchanges, tokens and trading pairs.</div>
					{/if}
				</div>
			</div>
		</div>
	</section>
</main>

<style>
	.search-box {
		gap: 1em;
		max-width: 830px;
		--text-input-width: 100%;
	}

	h1 {
		font: var(--f-h2-medium);
	}

	h2 {
		font-size: 1rem;
		margin: 0 1ex 0 0;
		white-space: nowrap;
	}

	button.close-filters {
		border: none;
		border-radius: 0.5em;
		height: 100%;
		padding: 0 1em;
		font-weight: 600;
		font-size: 0.75rem;
		letter-spacing: 0.02em;
		text-transform: uppercase;
		background: var(--c-background-3);
		color: var(--c-text-6);
	}

	button.clear-filters {
		border: none;
		background-color: transparent;
		padding: 0;
		font-size: 0.875rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.1ex;
		color: var(--c-text-1);
		cursor: pointer;
	}

	button.clear-filters:hover {
		border-bottom: 1px solid currentColor;
	}

	button.clear-filters:disabled {
		color: var(--c-text-2);
		font-weight: 400;
		border-color: transparent;
		text-decoration: none;
		cursor: default;
	}

	.results ul {
		display: grid;
		padding: 1.5rem 0 0 0;
		max-width: 800px;
	}

	@media (max-width: 768px) {
		.filters,
		.close-filters {
			display: none;
		}

		.isOpen {
			display: block;
		}
	}

	@media (--viewport-md-up) {
		.results ul {
			gap: 1.5rem;
		}
	}
</style>
