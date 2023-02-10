<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { Subscribe, Render, type BodyCell } from 'svelte-headless-table';

	export let attrs: HTMLAttributes<HTMLTableRowElement>;
	export let cells: BodyCell<any, any>[];
</script>

<tr {...attrs}>
	{#each cells as cell (cell.id)}
		<Subscribe cellAttrs={cell.attrs()} let:cellAttrs>
			<td class={cell.id} {...cellAttrs} data-label={cell.column.header}>
				<Render of={cell.render()} />
			</td>
		</Subscribe>
	{/each}
</tr>
