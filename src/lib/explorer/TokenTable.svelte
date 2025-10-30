<script module lang="ts">
	export const sortOptions = {
		keys: ['volume_24h', 'liquidity_latest'],
		directions: ['desc', 'asc']
	} as const;

	type SortOptions = typeof sortOptions;
</script>

<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import type { TokenIndexResponse } from './token-client';
	import { type Writable, writable } from 'svelte/store';
	import { createTable } from 'svelte-headless-table';
	import { addSortBy, addPagination } from 'svelte-headless-table/plugins';
	import { createRender } from '$lib/components/datatable/utils';
	import { formatDollar, formatValue } from '$lib/helpers/formatters';
	import DataTable from '$lib/components/datatable/DataTable.svelte';
	import TableRowTarget from '$lib/components/datatable/TableRowTarget.svelte';

	type DataTableProps = Omit<ComponentProps<typeof DataTable>, 'tableViewModel'>;

	interface Props extends DataTableProps {
		rows?: TokenIndexResponse['rows'];
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
		totalRowCount = 0,
		...restProps
	}: Props = $props();

	const tableRows: Writable<TokenIndexResponse['rows']> = writable([]);
	$effect(() => tableRows.set(loading ? new Array(10).fill({}) : rows || []));

	const serverItemCount = writable(0);
	$effect(() => serverItemCount.set(totalRowCount));

	const table = createTable(tableRows, {
		sort: addSortBy({
			serverSide: true,
			toggleOrder: ['desc', 'asc']
		}),
		page: addPagination({ serverSide: true, serverItemCount })
	});

	const columns = table.createColumns([
		table.column({
			accessor: 'name',
			header: 'Name',
			cell: ({ value }) => formatValue(value),
			plugins: { sort: { disable: true } }
		}),
		table.column({
			accessor: 'symbol',
			header: 'Symbol',
			cell: ({ value }) => formatValue(value),
			plugins: { sort: { disable: true } }
		}),
		table.column({
			accessor: 'volume_24h',
			header: 'Volume 24h (USD)',
			cell: ({ value }) => formatDollar(value)
		}),
		table.column({
			accessor: 'liquidity_latest',
			header: 'Liquidity (USD)',
			cell: ({ value }) => formatDollar(value)
		}),
		table.column({
			id: 'cta',
			accessor: (row) => `/trading-view/${row.chain_slug}/tokens/${row.address}`,
			header: '',
			cell: ({ value }) => createRender(TableRowTarget, { label: 'View token', href: value }),
			plugins: { sort: { disable: true } }
		})
	]);

	const tableViewModel = table.createViewModel(columns);

	const { pageIndex } = tableViewModel.pluginStates.page;
	$effect(() => pageIndex.set(page));

	const { sortKeys } = tableViewModel.pluginStates.sort;
	$effect(() => sortKeys.set([{ id: sort, order: direction }]));
</script>

<div class="token-table" data-testid="token-table">
	<DataTable isResponsive hasPagination targetableRows {loading} {tableViewModel} {totalRowCount} {...restProps} />
</div>

<style>
	.token-table {
		@media (--viewport-md-up) {
			:global(table) {
				table-layout: fixed;
			}

			:global(.name) {
				width: 35%;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}

			:global(.symbol) {
				width: 15%;
			}

			:global(.volume_24h) {
				width: 25%;
				text-align: right;
			}

			:global(.liquidity_latest) {
				width: 25%;
				text-align: right;
			}

			:global(.cta) {
				width: 11rem;
				padding-left: 1rem;
			}
		}
	}
</style>
