<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { Subscribe, type BodyRow } from 'svelte-headless-table';
	import TableRow from './TableRow.svelte';

	export let attrs: HTMLAttributes<HTMLTableSectionElement>;
	export let rows: BodyRow<any, any>[];
</script>

<tbody {...attrs}>
	{#each rows as row (row.id)}
		<Subscribe rowAttrs={row.attrs()} let:rowAttrs rowProps={row.props()} let:rowProps>
			{#if rowProps.clickable}
				<a href={rowProps.clickable.href} style:display="contents">
					<TableRow attrs={rowAttrs} cells={row.cells} />
				</a>
			{:else}
				<TableRow attrs={rowAttrs} cells={row.cells} />
			{/if}
		</Subscribe>
	{/each}
</tbody>
