<script lang="ts">
	import type { BodyRow } from 'svelte-headless-table';
	import { Subscribe, Render } from 'svelte-headless-table';

	export let attrs: svelte.JSX.HTMLAttributes<HTMLElementTagNameMap['tbody']>;
	export let rows: BodyRow<any, any>[];
</script>

<tbody {...attrs}>
	{#each rows as row (row.id)}
		<Subscribe rowAttrs={row.attrs()} let:rowAttrs>
			<tr {...rowAttrs}>
				{#each row.cells as cell (cell.id)}
					<Subscribe attrs={cell.attrs()} let:attrs>
						<td class={cell.id} {...attrs}>
							<Render of={cell.render()} />
						</td>
					</Subscribe>
				{/each}
			</tr>
		</Subscribe>
	{/each}
</tbody>
