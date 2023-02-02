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
	import type { TableViewModel } from 'svelte-headless-table';
	import TableHeader from './TableHeader.svelte';
	import TableBody from './TableBody.svelte';
	import TableFooter from './TableFooter.svelte';
	import SearchHeaderRow from './SearchHeaderRow.svelte';

	export let tableViewModel: TableViewModel<any, any>;
	export let hasSearch: boolean = false;
	export let hasPagination: boolean = false;
	export let isResponsive = false;

	const { headerRows, pageRows, rows, tableAttrs, tableHeadAttrs, tableBodyAttrs, pluginStates } = tableViewModel;
	const filterValue = pluginStates.tableFilter?.filterValue;
</script>

<div class="data-table">
	<table {...$tableAttrs} class:responsive={isResponsive}>
		<TableHeader attrs={$tableHeadAttrs} rows={$headerRows}>
			{#if hasSearch}
				<SearchHeaderRow bind:value={$filterValue} />
			{/if}
		</TableHeader>

		<TableBody attrs={$tableBodyAttrs} rows={hasPagination ? $pageRows : $rows} />

		{#if hasPagination}
			<TableFooter page={pluginStates.page} totalRowCount={$rows.length} />
		{/if}
	</table>
</div>
