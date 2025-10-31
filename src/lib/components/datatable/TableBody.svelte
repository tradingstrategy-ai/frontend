<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { PaginationState } from 'svelte-headless-table/plugins';
	import { Subscribe, type BodyRow } from 'svelte-headless-table';
	import TableRow from './TableRow.svelte';

	interface Props {
		attrs: HTMLAttributes<HTMLTableSectionElement>;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		rows: BodyRow<any, any>[];
		page: PaginationState | undefined;
		targetableRows?: boolean;
		children?: Snippet;
	}

	let { attrs, rows, page, targetableRows = false, children }: Props = $props();

	const { pageIndex, pageSize } = page ?? {};

	let offsetWidth = $state<number>();

	function getRowIndex(pageRowIndex: number) {
		if ($pageIndex !== undefined && $pageSize !== undefined) {
			return $pageIndex * $pageSize + pageRowIndex + 1;
		}
	}
</script>

<!-- --table-width needed for proper tr.targetable styling  -->
<tbody {...attrs} bind:offsetWidth style:--table-width="{offsetWidth}px">
	{@render children?.()}
	{#each rows as row, pageRowIndex (row.id)}
		<Subscribe rowAttrs={row.attrs()} let:rowAttrs>
			<TableRow attrs={rowAttrs} cells={row.cells} index={getRowIndex(pageRowIndex)} targetable={targetableRows} />
		</Subscribe>
	{/each}
</tbody>
