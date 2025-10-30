<script module lang="ts">
	export const sortOptions = {
		keys: ['tvl', 'asset_label', 'protocol_name', 'supply_apr_latest', 'variable_borrow_apr_latest'],
		directions: ['desc', 'asc']
	} as const;

	type SortOptions = typeof sortOptions;
</script>

<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import type { LendingReserve } from './lending-reserve-client';
	import { writable } from 'svelte/store';
	import { createTable } from 'svelte-headless-table';
	import { addSortBy, addPagination } from 'svelte-headless-table/plugins';
	import { createRender } from '$lib/components/datatable/utils';
	import DataTable from '$lib/components/datatable/DataTable.svelte';
	import TableRowTarget from '$lib/components/datatable/TableRowTarget.svelte';
	import LendingReserveLabel from './LendingReserveLabel.svelte';
	import BorrowAprCell from './BorrowAprCell.svelte';
	import { getFormattedReserveUSD, lendingReserveInternalUrl } from '$lib/helpers/lending-reserve';
	import { formatDollar, formatInterestRate } from '$lib/helpers/formatters';

	type DataTableProps = Omit<ComponentProps<typeof DataTable>, 'tableViewModel'>;

	interface Props extends DataTableProps {
		rows?: LendingReserve[];
		page?: number;
		sort?: SortOptions['keys'][number];
		direction?: SortOptions['directions'][number];
		hideChainIcon?: boolean;
	}

	let {
		rows,
		page = 0,
		sort = sortOptions.keys[0],
		direction = sortOptions.directions[0],
		loading = false,
		hideChainIcon = false,
		...restProps
	}: Props = $props();

	// set tableRows to real or dummy table rows based on laoding state
	let tableRows: LendingReserve[] = $derived(loading ? new Array(10).fill({}) : (rows ?? []));

	// create a store needed createTable - initial state of tableRows is required for SSR / to prevent FOUC
	// svelte-ignore state_referenced_locally
	const tableRowsStore = writable(tableRows);

	// update the store when data changes
	$effect(() => tableRowsStore.set(tableRows));

	const table = createTable(tableRowsStore, {
		sort: addSortBy({
			initialSortKeys: [{ id: sort, order: direction }],
			toggleOrder: ['asc', 'desc']
		}),
		page: addPagination({ initialPageIndex: page })
	});

	const columns = table.createColumns([
		table.column({
			id: 'asset_label',
			accessor: (row) => row,
			header: 'Reserve',
			cell: ({ value: reserve }) => createRender(LendingReserveLabel, { reserve, hideChainIcon }),
			plugins: {
				sort: {
					getSortValue: ({ asset_symbol }) => asset_symbol
				}
			}
		}),
		table.column({
			accessor: 'protocol_name',
			header: 'Protocol'
		}),
		table.column({
			id: 'tvl',
			accessor: (row) => {
				const tvl = getFormattedReserveUSD(row)?.totalLiquidityUSD;
				// return null (vs. undefined) to sort properly in svelte-headless-table
				return tvl ? Number(tvl) : null;
			},
			header: 'TVL',
			cell: ({ value }) => formatDollar(value)
		}),
		table.column({
			id: 'supply_apr_latest',
			accessor: (row) => row.additional_details?.supply_apr_latest,
			header: 'Supply APR',
			cell: ({ value }) => formatInterestRate(value)
		}),
		table.column({
			id: 'variable_borrow_apr_latest',
			accessor: (row) => row,
			header: 'Borrow APR',
			cell: ({ value: reserve }) => createRender(BorrowAprCell, { reserve }),
			plugins: {
				sort: {
					getSortValue: (reserve) => reserve.additional_details?.variable_borrow_apr_latest
				}
			}
		}),
		table.column({
			id: 'cta',
			accessor: lendingReserveInternalUrl,
			header: '',
			cell: ({ value }) => createRender(TableRowTarget, { label: 'View reserve', href: value, size: 'xs' }),
			plugins: { sort: { disable: true } }
		})
	]);

	const tableViewModel = table.createViewModel(columns);
</script>

<div class="reserve-table" data-testid="reserve-table">
	<DataTable isResponsive hasPagination targetableRows {loading} {tableViewModel} {...restProps} />
</div>

<style>
	.reserve-table {
		@media (--viewport-sm-down) {
			:global(.asset_label) {
				grid-column: 1/-1;
			}
		}

		@media (--viewport-md-up) {
			:global(table) {
				table-layout: fixed;
			}

			:global(.asset_label) {
				width: 43%;

				:global(*) {
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}
			}

			:global(.protocol_name) {
				width: 12%;
				white-space: nowrap;
			}

			:global(:is(.tvl, .supply_apr_latest, .variable_borrow_apr_latest)) {
				width: 15%;
				text-align: right;
			}

			:global(.cta) {
				width: 9rem;
			}
		}
	}
</style>
