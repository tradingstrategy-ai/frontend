<!--
Advanced Search page
- uses (tradingstrategy/search)[https://github.com/tradingstrategy-ai/search] backend
- auto-populates search box with `q` query param if supplied
- returns first 200 matching results (future: pagination or infinite scroll)
-->
<script lang="ts">
	import { page, session } from '$app/stores';
	import { formatDollar } from '$lib/helpers/formatters';
	import tradingEntitiesStore from '$lib/search/trading-entities';
	import SortSelect, { sortOptions } from './_SortSelect.svelte';
	import FacetFilter from './_FacetFilter.svelte';
	import RangeFilter from './_RangeFilter.svelte';
	import NumericFilter from './_NumericFilter.svelte';
	import TradingEntityHit from '$lib/search/TradingEntityHit.svelte';

	const tradingEntities = tradingEntitiesStore($session.config.typesense);

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
		<div class="container">
			<div class="row my-3 my-md-0">
				<div class="col-md-3 d-none d-md-block">
					<h1>Search</h1>
				</div>
				<div class="search-box col-md-9 d-flex align-items-center">
					<input
						type="search"
						data-cy="search"
						placeholder="search"
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
						<ul class="list-group">
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
		max-width: 630px;
	}

	h2 {
		font-size: 1rem;
		margin: 0 1ex 0 0;
		white-space: nowrap;
	}

	input {
		flex: 1;
		height: 40px;
		width: 100%;
		padding: 0 1ex 0 2em;
		border: 2px solid #44476a;
		border-radius: 20px;
		outline: none;
		background: rgba(255, 255, 255, 0.5) url('/images/search.svg') 1ex 55%/16px no-repeat;
		font-size: 1rem;
		color: #44476a;
	}

	input:focus {
		background-color: rgba(255, 255, 255, 0.75);
		box-shadow: 0 0 10px #44476a55;
	}

	input::placeholder {
		color: #44476a80;
	}

	button.close-filters {
		background-color: #44476a;
		border: none;
		border-radius: 1em;
		height: 100%;
		padding: 0 1em;
		font-weight: 600;
		font-size: 0.75rem;
		color: white;
		text-transform: uppercase;
		opacity: 0.8;
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

	.results .list-group {
		max-width: 600px;
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

	@media (max-width: 576px) {
		.results {
			padding: 0;
		}
	}
</style>
