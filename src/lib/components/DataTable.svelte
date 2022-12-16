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
	import { DataTablePagination, SearchInput } from '$lib/components';

	export let tableViewModel: TableViewModel<any, any>;
	export let searchInputValue: string = '';
	export let hasSearch: boolean = false;
	export let hasPagination: boolean = false;

	const { headerRows, rows, tableAttrs, tableBodyAttrs } = tableViewModel;
</script>

<div class="data-table">
	<table {...$tableAttrs}>
		<thead>
			{#each $headerRows as headerRow (headerRow.id)}
				<Subscribe rowAttrs={headerRow.attrs()} let:rowAttrs>
					<tr {...rowAttrs}>
						{#each headerRow.cells as cell (cell.id)}
							<Subscribe attrs={cell.attrs()} let:attrs props={cell.props()} let:props>
								<th {...attrs} class={cell.id} class:is-sorted={props.sort.order} on:click={props.sort.toggle}>
									<Render of={cell.render()} />
									{#if props.sort.order === 'asc'}
										<span class="sorting-indicator">▼</span>
									{:else if props.sort.order === 'desc'}
										<span class="sorting-indicator">▲</span>
									{/if}
								</th>
							</Subscribe>
						{/each}
					</tr>
				</Subscribe>
			{/each}
			{#if hasSearch}
				<tr>
					<th class="search-cell" colspan="6">
						<SearchInput
							id="position-table-search"
							name="position-table-search"
							placeholder="Find in the table"
							bind:value={searchInputValue}
						/>
					</th>
				</tr>
			{/if}
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
		{#if hasPagination}
			<tfoot>
				<tr>
					<td colspan="6">
						<DataTablePagination totalEntriesNumber={999} />
					</td>
				</tr>
			</tfoot>
		{/if}
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

		& :global(.search-input) {
			max-width: calc(100vw - 3rem);
		}
	}

	th {
		background-color: var(--c-body);
		color: var(--c-text-extra-light);
		font: var(--f-ui-md-medium);

		&:not(.search-cell) {
			padding: 1rem 1.25rem;

			&.is-sorted {
				padding: 1rem 2rem 1rem 1.25rem;
			}
		}

		&.search-cell {
			padding: 0.5rem 0;
		}
	}

	.sorting-indicator {
		position: absolute;
		transform: translate(0.5rem);
	}

	td {
		background: var(--c-background-5);
		height: 4.5rem;
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

	tfoot td {
		background: none !important;
		padding: 0;
	}
</style>
