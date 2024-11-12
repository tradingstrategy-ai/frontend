<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { type BodyCell, Subscribe, Render } from 'svelte-headless-table';

	export let attrs: HTMLAttributes<HTMLTableRowElement>;
	export let index: number | undefined;
	export let cells: BodyCell<any, any>[];
	export let targetable = false;
</script>

<tr {...attrs} data-row-index={index} class:targetable>
	{#each cells as cell (cell.id)}
		<Subscribe cellAttrs={cell.attrs()} let:cellAttrs>
			<td class={cell.id} {...cellAttrs} data-label={cell.column.header}>
				<Render of={cell.render()} />
			</td>
		</Subscribe>
	{/each}
</tr>
