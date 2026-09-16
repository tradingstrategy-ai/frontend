<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { PaginationState } from 'svelte-headless-table/plugins';
	import { tableWidth } from '$lib/actions/table-width';
	import { Subscribe, type BodyRow } from 'svelte-headless-table';
	import TableRow from './TableRow.svelte';

	interface Props {
		attrs: HTMLAttributes<HTMLTableSectionElement>;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		rows: BodyRow<any, any>[];
		page: PaginationState | undefined;
		targetableRows?: boolean;
		getRowClass?: (row: unknown) => string | undefined;
		children?: Snippet;
	}

	let { attrs, rows, page, targetableRows = false, getRowClass, children }: Props = $props();

	let pageIndex = $derived(page?.pageIndex);
	let pageSize = $derived(page?.pageSize);

	function getRowIndex(pageRowIndex: number) {
		if ($pageIndex !== undefined && $pageSize !== undefined) {
			return $pageIndex * $pageSize + pageRowIndex + 1;
		}
	}

	function resolveRowClass(row: BodyRow<any, any>) {
		if (!row.isData()) return undefined;
		return getRowClass?.(row.original);
	}
</script>

<!-- --table-width needed for proper tr.targetable styling  -->
<tbody {...attrs} use:tableWidth>
	{@render children?.()}
	{#each rows as row, pageRowIndex (row.id)}
		<Subscribe rowAttrs={row.attrs()} let:rowAttrs>
			<TableRow
				attrs={rowAttrs}
				cells={row.cells}
				index={getRowIndex(pageRowIndex)}
				targetable={targetableRows}
				rowClass={resolveRowClass(row)}
			/>
		</Subscribe>
	{/each}
</tbody>
