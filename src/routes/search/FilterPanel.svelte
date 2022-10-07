<script lang="ts">
	import { formatDollar } from '$lib/helpers/formatters';
	import SortSelect from './SortSelect.svelte';
	import FacetFilter from './FacetFilter.svelte';
	import RangeFilter from './RangeFilter.svelte';
	import NumericFilter from './NumericFilter.svelte';

	// define types (where?): Facet, FilterVal, Filter
	type FilterVal = Record<string, string>;
	type Filter = Record<string, any[]>;
	type Facet = { field_name: string; counts: any[] }; // improve me!

	export let sortOption: string;
	export let filterBy: string[] = [];
	export let facets: Facet[] = [];

	let filters: Filter = {};
	let filterVals: FilterVal = {};

	$: filterBy = Object.values(filterVals).filter((v) => v);

	function handleFilterChange({ detail }) {
		filterVals[detail.fieldName] = detail.filter;
	}

	function clearAllFilters() {
		for (const name in filters) {
			filters[name] = [];
		}
	}
</script>

<div class="filters">
	<div class="sort-control">
		<SortSelect bind:value={sortOption} />
	</div>
	<div class="clear-control">
		<button class="clear-filters" disabled={filterBy.length === 0} on:click={clearAllFilters}>
			{filterBy.length === 0 ? 'Select filters' : '× Clear filters'}
		</button>
	</div>

	{#each facets as { field_name, counts } (field_name)}
		<FacetFilter
			bind:selected={filters[field_name]}
			fieldName={field_name}
			options={counts}
			on:change={handleFilterChange}
		/>
	{/each}
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

<style lang="postcss">
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

		&:hover {
			border-bottom: 1px solid currentColor;
		}

		&:disabled {
			color: var(--c-text-2);
			font-weight: 400;
			border-color: transparent;
			text-decoration: none;
			cursor: default;
		}
	}

	@media (--viewport-lg-up) {
		.sort-control {
			display: none;
		}
	}
</style>
