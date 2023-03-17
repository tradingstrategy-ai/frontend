<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { PaginationState } from 'svelte-headless-table/lib/plugins/addPagination';
	import { Subscribe, type BodyRow } from 'svelte-headless-table';
	import TableRow from './TableRow.svelte';

	export let attrs: HTMLAttributes<HTMLTableSectionElement>;
	export let rows: BodyRow<any, any>[];
	export let page: PaginationState | undefined;

	function getRowIndex(pageIndex: number | undefined, pageSize: number | undefined, pageRowIndex: number) {
		if (pageIndex !== undefined && pageSize !== undefined) {
			return pageIndex * pageSize + pageRowIndex + 1;
		}
	}
</script>

<tbody {...attrs}>
	{#each rows as row, pageRowIndex (row.id)}
		<!-- prettier-ignore -->
		<Subscribe
			rowAttrs={row.attrs()} let:rowAttrs
			rowProps={row.props()} let:rowProps
			pageIndex={page?.pageIndex} let:pageIndex
			pageSize={page?.pageSize} let:pageSize
		>
			{#if rowProps.clickable}
				<a href={row.cellForId[rowProps.clickable.id].value} style:display="contents">
					<TableRow attrs={rowAttrs} cells={row.cells} index={getRowIndex(pageIndex, pageSize, pageRowIndex)} />
				</a>
			{:else}
				<TableRow attrs={rowAttrs} cells={row.cells} />
			{/if}
		</Subscribe>
	{/each}
</tbody>
