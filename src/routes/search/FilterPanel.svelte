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
	export let filters: Filter = {};

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
			<SortSelect bind:value={sortBy} />
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
			<NumericFilter
				bind:selected={filters['pool_swap_fee']}
				fieldName="pool_swap_fee"
				filters={['0.0001', '0.0005', '0.003', '0.01']}
				labels={['0.01%', '0.05%', '0.3%', '1.0%']}
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
			background: hsla(var(--hsl-body));
			box-shadow: 0 -0.25rem 2rem var(--c-shadow-1-v1);
			transition: transform 0.35s;

			&:not(.open) {
				transform: translateY(calc(100vh + var(--space-xl)));
			}
		}
	}

	header {
		display: grid;
		grid-template-columns: 1fr auto;
		padding: var(--space-md);

		@media (--viewport-lg-up) {
			display: none;
		}

		& h4 {
			font: var(--f-ui-xl-medium);
			letter-spacing: var(--f-ui-xl-spacing, normal);
		}

		& button {
			border: none;
			background: transparent;
			padding: 0;
		}
	}

	section {
		display: grid;
		gap: var(--space-ls);

		@media (--viewport-md-down) {
			padding: var(--space-sl) var(--space-md) 6.25rem var(--space-md);
		}
	}

	.filters {
		display: grid;
		gap: var(--space-2xl);
	}

	footer {
		position: fixed;
		width: 100%;
		bottom: 0;
		padding: var(--space-sl);
		display: grid;
		background: hsla(var(--hsl-body));
		box-shadow: 0 -0.25rem 2rem var(--c-shadow-1-v1);

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
		font: var(--f-heading-sm-roman);
		letter-spacing: var(--f-heading-sm-spacing, normal);
		color: var(--c-text-1-v1);
		text-align: left;

		@media (--viewport-lg-up) {
			height: 3rem;
		}

		&:not(:disabled) {
			cursor: pointer;
			font: var(--f-heading-sm-medium);
			text-decoration: underline;
		}
	}

	@media (--viewport-lg-up) {
		.sort-control {
			display: none;
		}
	}
</style>
