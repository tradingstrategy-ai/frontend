<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { type BodyCell, Subscribe, Render } from 'svelte-headless-table';

	interface Props {
		index: number | undefined;
		attrs: HTMLAttributes<HTMLTableRowElement>;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		cells: BodyCell<any, any>[];
		targetable: boolean;
		rowClass?: string;
	}

	let { index, attrs, cells, targetable = false, rowClass }: Props = $props();
</script>

<tr {...attrs} data-row-index={index} class={[attrs.class, targetable && 'targetable', rowClass]}>
	{#each cells as cell (cell.id)}
		<Subscribe cellAttrs={cell.attrs()} let:cellAttrs>
			<!-- eslint-disable-next-line svelte/require-store-reactive-access -->
			<td class={cell.id} {...cellAttrs} data-label={cell.column.header}>
				<Render of={cell.render()} />
			</td>
		</Subscribe>
	{/each}
</tr>
