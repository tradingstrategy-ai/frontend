<script lang="ts">
	import { formatDollar } from '$lib/helpers/formatters';
	import { Button, Icon } from '$lib/components';
	import SortSelect from './SortSelect.svelte';
	import FacetFilter from './FacetFilter.svelte';
	import RangeFilter from './RangeFilter.svelte';
	import NumericFilter from './NumericFilter.svelte';

	type FilterVal = Record<string, string>;
	type Filter = Record<string, any[]>;
	type FacetCount = { value: string; count: number };
	type Facet = { field_name: string; counts: FacetCount[] };

	export let open = false;
	export let sortBy: string;
	export let filterBy: string[] = [];
	export let facets: Facet[] = [];

	let filters: Filter = {};
	let filterVals: FilterVal = {};
	let panel: HTMLElement;

	$: filterBy = Object.values(filterVals).filter((v) => v);
	$: hasFilters = filterBy.length > 0;

	function handleFilterChange({ detail }) {
		filterVals[detail.fieldName] = detail.filter;
	}

	function clearAllFilters() {
		for (const name in filters) {
			filters[name] = [];
		}
	}

	function close() {
		open = false;
		window.scrollTo(0, 0);
		panel.scrollTo(0, 0);
	}
</script>

<div bind:this={panel} class="filter-panel" class:open>
	<header>
		<h4>Select filters</h4>
		<button on:click={close}>
			<Icon name="cancel" />
		</button>
	</header>

	<section>
		<div class="sort-control">
			<SortSelect bind:sortBy />
		</div>

		<button class="clear-filters" disabled={!hasFilters} on:click={clearAllFilters}>
			{#if hasFilters}
				Clear filters
				<Icon name="cancel" size="16px" />
			{:else}
				Select filters
			{/if}
		</button>

		<div class="filters">
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
	</section>

	<footer>
		<Button label="Apply Filters" on:click={close} />
	</footer>
</div>

<style lang="postcss">
	.filter-panel {
		@media (--viewport-md-down) {
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			z-index: 10;
			overflow-y: scroll;
			background: var(--c-body);
			box-shadow: 0 -0.25rem 2rem var(--c-shadow-1);
			transition: transform 0.35s;

			&:not(.open) {
				transform: translateY(calc(100vh + 2rem));
			}
		}
	}

	header {
		display: grid;
		grid-template-columns: 1fr auto;
		padding: 1rem;

		@media (--viewport-lg-up) {
			display: none;
		}

		& h4 {
			font: 500 var(--fs-ui-xl);
		}

		& button {
			border: none;
			background: transparent;
			padding: 0;
		}
	}

	section {
		display: grid;
		gap: 1.25rem;

		@media (--viewport-md-down) {
			padding: 0.75rem 1rem 6.25rem 1rem;
		}
	}

	.filters {
		display: grid;
		gap: 2.25rem;
	}

	footer {
		position: fixed;
		width: 100%;
		bottom: 0;
		padding: 0.75rem;
		display: grid;
		background: var(--c-body);
		box-shadow: 0 -0.25rem 2rem var(--c-shadow-1);

		@media (--viewport-lg-up) {
			display: none;
		}
	}

	.clear-filters {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		border: none;
		background-color: transparent;
		padding: 0;
		text-transform: uppercase;
		font: 500 var(--fs-heading-sm);
		color: var(--c-text-1);
		text-align: left;

		@media (--viewport-lg-up) {
			height: 3rem;
		}

		&:not(:disabled) {
			cursor: pointer;
			font-weight: 600;
			text-decoration: underline;
		}
	}

	@media (--viewport-lg-up) {
		.sort-control {
			display: none;
		}
	}
</style>
