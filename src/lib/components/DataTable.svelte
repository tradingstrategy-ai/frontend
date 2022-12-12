<!--
@component
Display a data table using the `svelte-headless-table` library.
See: https://svelte-headless-table.bryanmylee.com

The expected `tableViewModel` prop is the result of calling `table.createViewModel()`.
See: https://svelte-headless-table.bryanmylee.com/docs/api/create-view-model

#### Usage:
```tsx
  <DataTable {tableViewModel} />
```
-->
<script lang="ts">
	import type { TableViewModel } from 'svelte-headless-table';
	import { Subscribe, Render } from 'svelte-headless-table';

	export let tableViewModel: TableViewModel<any, any>;

	const { headerRows, rows, tableAttrs, tableBodyAttrs } = tableViewModel;
</script>

<div class="data-table">
	<table {...$tableAttrs}>
		<thead>
			{#each $headerRows as headerRow (headerRow.id)}
				<Subscribe rowAttrs={headerRow.attrs()} let:rowAttrs>
					<tr {...rowAttrs}>
						{#each headerRow.cells as cell (cell.id)}
							<Subscribe attrs={cell.attrs()} let:attrs>
								<th class={cell.id} {...attrs}>
									<Render of={cell.render()} />
								</th>
							</Subscribe>
						{/each}
					</tr>
				</Subscribe>
			{/each}
		</thead>
		<tbody {...$tableBodyAttrs}>
			{#each $rows as row (row.id)}
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
	</table>
</div>

<style lang="postcss">
	.data-table {
		overflow: auto;
	}

	table {
		border-collapse: separate;
		border-spacing: 0 0.75rem;
		margin-top: -0.75rem;
		width: 100%;
	}

	thead {
		position: sticky;
		top: 0;
	}

	th {
		padding: 1rem 1.25rem;
		background-color: var(--c-body);
		color: var(--c-text-extra-light);
		font: var(--f-ui-md-medium);
	}

	td {
		background: var(--c-background-5);
		padding: 0.75rem 1.5rem;
		font: var(--f-ui-lg-medium);
		--button-width: 100%;

		@media (--viewport-lg-down) {
			font: var(--f-ui-md-medium);
		}

		@media (--viewport-sm-down) {
			font: var(--f-ui-sm-medium);
		}

		@nest tr:hover & {
			background: var(--c-background-4);
		}

		&:first-child {
			border-radius: var(--border-radius-md) 0 0 var(--border-radius-md);
		}

		&:last-child {
			border-radius: 0 var(--border-radius-md) var(--border-radius-md) 0;
		}
	}
</style>
