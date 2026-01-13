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
	import type { Snippet } from 'svelte';
	import { writable, type Writable } from 'svelte/store';
	import type { TableViewModel } from 'svelte-headless-table';
	import type { SortKey } from 'svelte-headless-table/plugins';
	import TableHeader from './TableHeader.svelte';
	import TableBody from './TableBody.svelte';
	import TableFooter from './TableFooter.svelte';
	import SearchHeaderRow from './SearchHeaderRow.svelte';
	import MobileSortSelect from './MobileSortSelect.svelte';

	type DataTableChangeParams = {
		page: string;
		sort?: string;
		direction?: 'asc' | 'desc';
	};

	interface Props {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		tableViewModel: TableViewModel<any, any>;
		class?: string;
		size?: string;
		totalRowCount?: number | undefined;
		loading?: boolean;
		hasSearch?: boolean;
		hasPagination?: boolean;
		isResponsive?: boolean;
		targetableRows?: boolean;
		children?: Snippet;
		onChange?: (params: DataTableChangeParams, scrollFn: () => void) => void;
	}

	let {
		tableViewModel,
		class: classes = 'datatable',
		size = 'md',
		totalRowCount,
		loading = false,
		hasSearch = false,
		hasPagination = false,
		isResponsive = false,
		targetableRows = false,
		children,
		onChange
	}: Props = $props();

	let table: HTMLTableElement;

	let { headerRows, pageRows, rows, tableAttrs, tableHeadAttrs, tableBodyAttrs, pluginStates } =
		$derived(tableViewModel);

	// svelte-ignore state_referenced_locally
	const filterValue = pluginStates.tableFilter?.filterValue;

	// assign real plugin stores or fallback/dummy stores if sort/pagination not enabled
	// svelte-ignore state_referenced_locally
	const sortKeys: Writable<SortKey[]> = pluginStates.sort?.sortKeys || writable([]);
	// svelte-ignore state_referenced_locally
	const pageIndex: Writable<number> = pluginStates.page?.pageIndex || writable(0);

	let lastSortKey: SortKey | undefined = $sortKeys[0];
	let lastPageIdx = $pageIndex;

	$effect(() => {
		dispatchIfChanged($sortKeys[0], $pageIndex);
	});

	function scrollToTop() {
		if (table?.getBoundingClientRect().y < 0) {
			table.scrollIntoView({ behavior: 'smooth' });
		}
	}

	function dispatchIfChanged(sortKey: SortKey | undefined, pageIdx: number) {
		if (!onChange) return;

		const sortChanged = !(sortKey?.id === lastSortKey?.id && sortKey?.order === lastSortKey?.order);
		const pageChanged = pageIdx !== lastPageIdx;

		// prevent dispatch when returning to page via browser back button)
		if (!(sortChanged || pageChanged)) return;

		// if sort changed, reset page to 0
		if (sortChanged) $pageIndex = pageIdx = 0;

		// update "last" values for future comparison
		lastSortKey = sortKey;
		lastPageIdx = pageIdx;

		const params: DataTableChangeParams = { page: String(pageIdx) };
		if (sortKey) {
			Object.assign(params, { sort: sortKey.id, direction: sortKey.order });
		}

		// dispatch change event with updated page/sort params
		onChange(params, scrollToTop);
	}
</script>

<table bind:this={table} {...$tableAttrs} class={[classes, size, isResponsive && 'responsive', loading && 'loading']}>
	<TableHeader attrs={$tableHeadAttrs} rows={$headerRows}>
		{#if isResponsive}
			<MobileSortSelect rows={$headerRows} {sortKeys} />
		{/if}
		{#if hasSearch}
			<SearchHeaderRow bind:value={$filterValue} />
		{/if}
	</TableHeader>

	<TableBody attrs={$tableBodyAttrs} rows={hasPagination ? $pageRows : $rows} page={pluginStates.page} {targetableRows}>
		{@render children?.()}
	</TableBody>

	{#if hasPagination}
		<TableFooter page={pluginStates.page} totalRowCount={totalRowCount ?? $rows.length} />
	{/if}
</table>
