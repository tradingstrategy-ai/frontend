<!--
@component
Display a data table using the `svelte-headless-table` library.
See: https://svelte-headless-table.bryanmylee.com

The expected `tableViewModel` prop is the result of calling `table.createViewModel()`.
See: https://svelte-headless-table.bryanmylee.com/docs/api/create-view-model

@example

```svelte
  <DataTable {tableViewModel} hasSearch={true|false} hasPagination={true|false} />
```
-->
<script lang="ts">
	import { writable, type Writable } from 'svelte/store';
	import type { TableViewModel } from 'svelte-headless-table';
	import type { SortKey } from 'svelte-headless-table/plugins';
	import { createEventDispatcher } from 'svelte';
	import TableHeader from './TableHeader.svelte';
	import TableBody from './TableBody.svelte';
	import TableFooter from './TableFooter.svelte';
	import SearchHeaderRow from './SearchHeaderRow.svelte';
	import MobileSortSelect from './MobileSortSelect.svelte';

	export let tableViewModel: TableViewModel<any, any>;
	export let hasSearch: boolean = false;
	export let hasPagination: boolean = false;
	export let totalRowCount: number | undefined = undefined;
	export let isResponsive = false;
	export let loading = false;
	export let size = 'md';
	export let targetableRows = false;

	const dispatch = createEventDispatcher();
	let table: HTMLTableElement;

	const { headerRows, pageRows, rows, tableAttrs, tableHeadAttrs, tableBodyAttrs, pluginStates } = tableViewModel;

	const filterValue = pluginStates.tableFilter?.filterValue;

	// assign real plugin stores or fallback/dummy stores if sort/pagination not enabled
	const sortKeys: Writable<SortKey[]> = pluginStates.sort?.sortKeys || writable([]);
	const pageIndex: Writable<number> = pluginStates.page?.pageIndex || writable(0);

	let lastSortKey: SortKey | undefined = $sortKeys[0];
	let lastPageIdx = $pageIndex;

	$: dispatchIfChanged($sortKeys[0], $pageIndex);

	function scrollToTop() {
		if (table?.getBoundingClientRect().y < 0) {
			table.scrollIntoView({ behavior: 'smooth' });
		}
	}

	function dispatchIfChanged(sortKey: SortKey | undefined, pageIdx: number) {
		const sortChanged = !(sortKey?.id === lastSortKey?.id && sortKey?.order === lastSortKey?.order);
		const pageChanged = pageIdx !== lastPageIdx;

		// prevent dispatch when returning to page via browser back button)
		if (!(sortChanged || pageChanged)) return;

		// if sort changed, reset page to 0
		if (sortChanged) $pageIndex = pageIdx = 0;

		// update "last" values for future comparison
		lastSortKey = sortKey;
		lastPageIdx = pageIdx;

		// dispatch change event with updated page/sort params
		dispatch('change', {
			params: { page: pageIdx, sort: sortKey?.id, direction: sortKey?.order },
			scrollToTop
		});
	}
</script>

<table bind:this={table} {...$tableAttrs} class="datatable {size}" class:responsive={isResponsive} class:loading>
	<TableHeader attrs={$tableHeadAttrs} rows={$headerRows}>
		{#if isResponsive}
			<MobileSortSelect rows={$headerRows} {sortKeys} />
		{/if}
		{#if hasSearch}
			<SearchHeaderRow bind:value={$filterValue} />
		{/if}
	</TableHeader>

	<TableBody attrs={$tableBodyAttrs} rows={hasPagination ? $pageRows : $rows} page={pluginStates.page} {targetableRows}>
		<slot />
	</TableBody>

	{#if hasPagination}
		<TableFooter page={pluginStates.page} totalRowCount={totalRowCount ?? $rows.length} />
	{/if}
</table>
