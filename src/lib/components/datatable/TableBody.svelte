<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { PaginationState } from 'svelte-headless-table/lib/plugins/addPagination';
	import { Subscribe, type BodyRow } from 'svelte-headless-table';
	import TableRow from './TableRow.svelte';

	export let attrs: HTMLAttributes<HTMLTableSectionElement>;
	export let rows: BodyRow<any, any>[];
	export let page: PaginationState | {};

	const { pageIndex, pageSize } = page;

	function getRowIndex(pageRowIndex: number) {
		if ($pageIndex !== undefined && $pageSize !== undefined) {
			return $pageIndex * $pageSize + pageRowIndex + 1;
		}
	}
</script>

<tbody {...attrs}>
	{#each rows as row, pageRowIndex (row.id)}
		<Subscribe rowAttrs={row.attrs()} let:rowAttrs rowProps={row.props()} let:rowProps>
			<TableRow attrs={rowAttrs} props={rowProps} cells={row.cells} index={getRowIndex(pageRowIndex)} />
		</Subscribe>
	{/each}
</tbody>
