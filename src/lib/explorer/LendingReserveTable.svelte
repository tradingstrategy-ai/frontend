<script lang="ts">
	import type { LendingReserve } from './lending-reserve-client';
	import { writable, type Writable } from 'svelte/store';
	import { createRender, createTable } from 'svelte-headless-table';
	import { addSortBy, addPagination, addHiddenColumns } from 'svelte-headless-table/plugins';
	import { addClickableRows } from '$lib/components/datatable/plugins';
	import { Button, DataTable } from '$lib/components';
	import { formatInterestRate } from '$lib/helpers/formatters';
	import BorrowAprCell from './BorrowAprCell.svelte';

	export let loading = false;
	export let rows: LendingReserve[] | undefined = undefined;
	export let totalRowCount = 0;
	export let page = 0;
	export let sort = 'variable_borrow_apr_latest';
	export let direction: 'asc' | 'desc' = 'asc';
	export let hiddenColumns: string[] = [];

	const tableRows: Writable<LendingReserve[]> = writable([]);
	$: $tableRows = loading ? new Array(10).fill({}) : rows ?? [];

	const table = createTable(tableRows, {
		sort: addSortBy({
			serverSide: true,
			toggleOrder: ['asc', 'desc']
		}),
		page: addPagination({ serverSide: true }),
		clickable: addClickableRows({ id: 'cta' }),
		hide: addHiddenColumns({ initialHiddenColumnIds: hiddenColumns })
	});

	const columns = table.createColumns([
		table.column({
			accessor: 'asset_name',
			header: 'Asset name'
		}),
		table.column({
			accessor: 'asset_symbol',
			header: 'Symbol'
		}),
		table.column({
			id: 'supply_apr_latest',
			accessor: (row) => row?.additional_details?.supply_apr_latest,
			header: 'Supply APR',
			cell: ({ value }) => formatInterestRate(value)
		}),
		table.column({
			id: 'variable_borrow_apr_latest',
			accessor: (row) => row?.additional_details?.variable_borrow_apr_latest,
			header: 'Borrow APR',
			cell: ({ value, row }) => createRender(BorrowAprCell, { apr: value, reserve: row.original })
		}),
		table.column({
			id: 'cta',
			accessor: (row) => `/trading-view/${row.chain_slug}/lending/${row.protocol_slug}/${row.reserve_slug}`,
			header: '',
			cell: ({ value }) => createRender(Button, { label: 'View reserve', href: value }),
			plugins: { sort: { disable: true } }
		})
	]);

	const tableViewModel = table.createViewModel(columns);
	const { pageIndex, serverItemCount } = tableViewModel.pluginStates.page;
	const { sortKeys } = tableViewModel.pluginStates.sort;
	const { hiddenColumnIds } = tableViewModel.pluginStates.hide;

	$: $pageIndex = page;
	$: $serverItemCount = totalRowCount;
	$: $sortKeys = [{ id: sort, order: direction }];
	$: $hiddenColumnIds = hiddenColumns;
</script>

<div class="reserve-table" data-testid="reserve-table">
	<DataTable isResponsive hasPagination {loading} {tableViewModel} on:change />
</div>

<style lang="postcss">
	.reserve-table :global {
		@media (--viewport-md-up) {
			& table {
				table-layout: fixed;
			}

			& .asset_name {
				width: 40%;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}

			& .asset_symbol {
				width: 20%;
			}

			& :is(.supply_apr_latest, .variable_borrow_apr_latest) {
				width: 20%;
				text-align: right;
			}

			& .cta {
				width: 12rem;
			}
		}
	}
</style>
