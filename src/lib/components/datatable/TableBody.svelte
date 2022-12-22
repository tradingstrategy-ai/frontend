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

<style lang="postcss">
	td {
		background: var(--c-background-5);
		height: 4.5rem;
		padding: var(--space-sl) var(--space-lg);
		font: var(--f-ui-lg-medium);
		letter-spacing: var(--f-ui-lg-spacing, normal);
		--button-width: 100%;

		@media (--viewport-lg-down) {
			font: var(--f-ui-md-medium);
			letter-spacing: var(--f-ui-md-spacing, normal);
		}

		@media (--viewport-sm-down) {
			font: var(--f-ui-sm-medium);
			letter-spacing: var(--f-ui-sm-spacing, normal);
		}

		@nest tr:hover & {
			background: var(--c-background-4);
		}

		&:first-child {
			border-radius: var(--radius-md) 0 0 var(--radius-md);
		}

		&:last-child {
			border-radius: 0 var(--radius-md) var(--radius-md) 0;
		}
	}
</style>
