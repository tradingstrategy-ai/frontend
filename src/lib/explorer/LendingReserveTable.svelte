<script lang="ts">
	import type { LendingReserve } from './lending-reserve-client';
	import { writable, type Writable } from 'svelte/store';
	import { createRender, createTable } from 'svelte-headless-table';
	import { addSortBy, addPagination } from 'svelte-headless-table/plugins';
	import { addClickableRows } from '$lib/components/datatable/plugins';
	import { Button, DataTable } from '$lib/components';
	import LendingReserveLabel from './LendingReserveLabel.svelte';
	import BorrowAprCell from './BorrowAprCell.svelte';
	import { getFormattedReserveUSD, lendingReserveInternalUrl } from '$lib/helpers/lending-reserve';
	import { formatDollar, formatInterestRate } from '$lib/helpers/formatters';

	export let loading = false;
	export let rows: LendingReserve[] | undefined = undefined;
	export let page = 0;
	export let sort = 'tvl';
	export let direction: 'asc' | 'desc' = 'desc';
	export let hideChainIcon = false;

	const tableRows: Writable<LendingReserve[]> = writable([]);
	$: tableRows.set(loading ? new Array(10).fill({}) : (rows ?? []));

	const table = createTable(tableRows, {
		sort: addSortBy({
			initialSortKeys: [{ id: sort, order: direction }],
			toggleOrder: ['asc', 'desc']
		}),
		page: addPagination({ initialPageIndex: page }),
		clickable: addClickableRows({ id: 'cta' })
	});

	const columns = table.createColumns([
		table.column({
			id: 'asset_label',
			accessor: (row) => row.asset_symbol, // sort by asset_symbol
			header: 'Reserve',
			cell: ({ row }) => createRender(LendingReserveLabel, { reserve: row.original, hideChainIcon })
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
			accessor: (row) => row.additional_details?.variable_borrow_apr_latest,
			header: 'Borrow APR',
			cell: ({ value, row }) => createRender(BorrowAprCell, { apr: value, reserve: row.original })
		}),
		table.column({
			id: 'cta',
			accessor: lendingReserveInternalUrl,
			header: '',
			cell: ({ value }) => createRender(Button, { label: 'View reserve', href: value, size: 'xs' }),
			plugins: { sort: { disable: true } }
		})
	]);

	const tableViewModel = table.createViewModel(columns);
</script>

<div class="reserve-table" data-testid="reserve-table">
	<DataTable isResponsive hasPagination {loading} {tableViewModel} on:change />
</div>

<style>
	.reserve-table :global {
		@media (--viewport-sm-down) {
			.asset_label {
				grid-column: 1/-1;
			}
		}

		@media (--viewport-md-up) {
			table {
				table-layout: fixed;
			}

			.asset_label {
				width: 43%;

				:global(*) {
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}
			}

			.protocol_name {
				width: 12%;
				white-space: nowrap;
			}

			:is(.tvl, .supply_apr_latest, .variable_borrow_apr_latest) {
				width: 15%;
				text-align: right;
			}

			.cta {
				width: 9rem;
			}
		}
	}
</style>
