<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { PaginationState } from 'svelte-headless-table/plugins';
	import { Subscribe, type BodyRow } from 'svelte-headless-table';
	import TableRow from './TableRow.svelte';

	export let attrs: HTMLAttributes<HTMLTableSectionElement>;
	export let rows: BodyRow<any, any>[];
	export let page: PaginationState | undefined;
	export let targetableRows = false;

	const { pageIndex, pageSize } = page ?? {};

	let offsetWidth: number;

	function getRowIndex(pageRowIndex: number) {
		if ($pageIndex !== undefined && $pageSize !== undefined) {
			return $pageIndex * $pageSize + pageRowIndex + 1;
		}
	}
</script>

<!-- --table-width needed for proper tr.targetable styling  -->
<tbody {...attrs} bind:offsetWidth style:--table-width="{offsetWidth}px">
	<slot />
	{#each rows as row, pageRowIndex (row.id)}
		<Subscribe rowAttrs={row.attrs()} let:rowAttrs>
			<TableRow attrs={rowAttrs} cells={row.cells} index={getRowIndex(pageRowIndex)} targetable={targetableRows} />
		</Subscribe>
	{/each}
</tbody>
