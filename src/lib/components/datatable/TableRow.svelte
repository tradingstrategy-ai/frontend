<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ClickableRowProps } from './plugins/addClickableRows';
	import TargetableLink from '$lib/components/TargetableLink.svelte';
	import { type BodyCell, Subscribe, Render } from 'svelte-headless-table';

	export let attrs: HTMLAttributes<HTMLTableRowElement>;
	export let props: Partial<ClickableRowProps>;
	export let index: number | undefined;
	export let cells: BodyCell<any, any>[];
</script>

<tr {...attrs} data-row-index={index} class:targetable={props.clickable}>
	{#each cells as cell (cell.id)}
		<Subscribe cellAttrs={cell.attrs()} let:cellAttrs>
			<td class={cell.id} {...cellAttrs} data-label={cell.column.header}>
				<Render of={cell.render()} />
				{#if props.clickable?.id === cell.id}
					<TargetableLink href={cell.value} srLabel="View details" />
				{/if}
			</td>
		</Subscribe>
	{/each}
</tr>
