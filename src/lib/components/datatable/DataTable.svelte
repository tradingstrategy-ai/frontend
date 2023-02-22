<!--
@component
Display a data table using the `svelte-headless-table` library.
See: https://svelte-headless-table.bryanmylee.com

The expected `tableViewModel` prop is the result of calling `table.createViewModel()`.
See: https://svelte-headless-table.bryanmylee.com/docs/api/create-view-model

#### Usage:
```tsx
  <DataTable {tableViewModel} hasSearch={true|false} hasPagination={true|false} />
```
-->
<script lang="ts">
	import { derived, writable, type Writable } from 'svelte/store';
	import type { TableViewModel } from 'svelte-headless-table';
	import type { WritableSortKeys } from 'svelte-headless-table/lib/plugins/addSortBy';
	import { createEventDispatcher } from 'svelte';
	import TableHeader from './TableHeader.svelte';
	import TableBody from './TableBody.svelte';
	import TableFooter from './TableFooter.svelte';
	import SearchHeaderRow from './SearchHeaderRow.svelte';
	import MobileSortSelect from './MobileSortSelect.svelte';

	export let tableViewModel: TableViewModel<any, any>;
	export let hasSearch: boolean = false;
	export let hasPagination: boolean = false;
	export let isResponsive = false;
	export let loading = false;

	const dispatch = createEventDispatcher();
	let table: HTMLTableElement;

	const { headerRows, pageRows, rows, tableAttrs, tableHeadAttrs, tableBodyAttrs, pluginStates } = tableViewModel;

	const filterValue = pluginStates.tableFilter?.filterValue;

	// set sortKeys to real plugin store or dummy store if sort not enabled (see watchPageAndSort)
	const sortKeys: WritableSortKeys = pluginStates.sort?.sortKeys || writable([{}]);

	// set pageIndex to real plugin store or dummy store if pagination not enabled (see watchPageAndSort)
	const pageIndex: Writable<number> = pluginStates.page?.pageIndex || writable(0);

	function scrollToTop() {
		if (table?.getBoundingClientRect().y < 0) {
			table.scrollIntoView({ behavior: 'smooth' });
		}
	}

	/**
	 * Use a derived store to detect and dispatch changes to page and sort stores
	 * - `set` argument (never used) is required in callback signature to support returning a function
	 * - see: https://svelte.dev/docs#run-time-svelte-store-derived
	 */
	const dispatchChange = derived([pageIndex, sortKeys], ([page, sort], set) => {
		// within the callback, page and sort will be the values prior to the invocation
		return () => {
			const sortChanged = sort[0].id !== $sortKeys[0].id || sort[0].order !== $sortKeys[0].order;
			const pageChanged = page !== $pageIndex;

			// if neither sort nor page changed, abort
			// prevents dispatch when returning to page with browser back button
			if (!sortChanged && !pageChanged) {
				return;
			}

			// if sort changed and table is not showing first page, reset page to 0 and abort
			// prevents redundant dispatch - callback will be re-invoked due to page change
			if (sortChanged && page > 0) {
				$pageIndex = 0;
				return;
			}

			const params = {
				page: $pageIndex,
				sort: $sortKeys[0].id,
				direction: $sortKeys[0].order
			};

			dispatch('change', { params, scrollToTop });
		};
	});
	// auto subscribe/unsubscribe
	$dispatchChange;
</script>

<table bind:this={table} {...$tableAttrs} class:responsive={isResponsive} class:loading>
	{#if isResponsive}
		<MobileSortSelect rows={$headerRows} {sortKeys} />
	{/if}

	<TableHeader attrs={$tableHeadAttrs} rows={$headerRows}>
		{#if hasSearch}
			<SearchHeaderRow bind:value={$filterValue} />
		{/if}
	</TableHeader>

	<TableBody attrs={$tableBodyAttrs} rows={hasPagination ? $pageRows : $rows} />

	{#if hasPagination}
		<TableFooter page={pluginStates.page} rowCount={$rows.length} />
	{/if}
</table>
