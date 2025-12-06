<script module lang="ts">
	export const sortOptions = {
		keys: ['vault_count', 'name', 'risk'],
		directions: ['desc', 'asc']
	} as const;

	type SortOptions = typeof sortOptions;
</script>

<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import type { VaultProtocol } from '$lib/top-vaults/schemas';
	import { readable } from 'svelte/store';
	import { createTable } from 'svelte-headless-table';
	import { addSortBy, addPagination } from 'svelte-headless-table/plugins';
	import { createRender } from '$lib/components/datatable/utils';
	import DataTable from '$lib/components/datatable/DataTable.svelte';
	import TableRowTarget from '$lib/components/datatable/TableRowTarget.svelte';

	type DataTableProps = Omit<ComponentProps<typeof DataTable>, 'tableViewModel'>;

	interface Props extends DataTableProps {
		rows?: VaultProtocol[];
		page?: number;
		sort?: SortOptions['keys'][number];
		direction?: SortOptions['directions'][number];
	}

	let {
		rows,
		page = 0,
		sort = sortOptions.keys[0],
		direction = sortOptions.directions[0],
		loading = false,
		...restProps
	}: Props = $props();

	$inspect(rows[0]);

	const tableRows = loading ? new Array(10).fill({}) : rows || [];

	const table = createTable(readable(tableRows), {
		sort: addSortBy({
			initialSortKeys: [{ id: sort, order: direction }],
			toggleOrder: ['desc', 'asc']
		}),
		page: addPagination({ initialPageIndex: page })
	});

	const columns = table.createColumns([
		table.column({
			header: 'Protocol',
			accessor: 'name',
			cell: ({ value }) => value
		}),
		table.column({
			accessor: 'risk',
			header: 'Risk',
			cell: ({ value }) => value ?? 'unknown'
		}),
		table.column({
			accessor: 'vault_count',
			header: 'Vaults',
			cell: ({ value }) => value
		}),
		table.column({
			id: 'cta',
			header: '',
			accessor: (row) => `/trading-view/vaults/protocols/${row.slug}`,
			cell: ({ value }) => createRender(TableRowTarget, { size: 'sm', label: 'View protocol', href: value }),
			plugins: { sort: { disable: true } }
		})
	]);

	const tableViewModel = table.createViewModel(columns);
</script>

<div class="vault-protocol-table">
	<DataTable isResponsive hasPagination targetableRows {loading} {tableViewModel} {...restProps} />
</div>

<style>
	.vault-protocol-table {
		:global(.name) {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;

			@media (--viewport-sm-down) {
				grid-column: 1/-1;
			}
		}

		@media (--viewport-md-up) {
			:global(table) {
				table-layout: fixed;
			}

			:global(.name) {
				width: 50%;
			}

			:global(.risk) {
				width: 25%;
			}

			:global(.vault_count) {
				width: 25%;
				text-align: right;
				padding-right: 5%;
			}

			:global(.cta) {
				width: 12rem;
			}
		}
	}
</style>
