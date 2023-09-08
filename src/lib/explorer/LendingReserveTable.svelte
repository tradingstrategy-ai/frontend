<script lang="ts">
	import type { LendingReserve } from './lending-reserve-client';
	import { writable, type Writable } from 'svelte/store';
	import { createRender, createTable } from 'svelte-headless-table';
	import { addSortBy, addPagination } from 'svelte-headless-table/plugins';
	import { addClickableRows } from '$lib/components/datatable/plugins';
	import { Button, DataTable, EntitySymbol } from '$lib/components';
	import BorrowAprCell from './BorrowAprCell.svelte';
	import { getFormattedReserveUSD } from '$lib/helpers/lending-reserve';
	import { formatDollar, formatInterestRate } from '$lib/helpers/formatters';

	export let loading = false;
	export let rows: LendingReserve[] | undefined = undefined;
	export let page = 0;
	export let sort = 'tvl';
	export let direction: 'asc' | 'desc' = 'desc';
	export let hideChainIcon = false;

	const tableRows: Writable<LendingReserve[]> = writable([]);
	$: $tableRows = loading ? new Array(10).fill({}) : rows ?? [];

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
			accessor: 'asset_name',
			header: 'Reserve',
			cell: ({ value, row: { original } }) =>
				createRender(EntitySymbol, {
					type: 'blockchain',
					slug: hideChainIcon ? undefined : original.chain_slug,
					label: original.chain_name,
					size: '1.25em'
				}).slot(value)
		}),
		table.column({
			accessor: 'asset_symbol',
			header: 'Symbol'
		}),
		table.column({
			id: 'tvl',
			accessor: (row) => {
				const tvl = getFormattedReserveUSD(row)?.totalLiquidityUSD;
				return tvl && Number(tvl);
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
			accessor: (row) => `/trading-view/${row.chain_slug}/lending/${row.protocol_slug}/${row.reserve_slug}`,
			header: '',
			cell: ({ value }) => createRender(Button, { label: 'View reserve', href: value }),
			plugins: { sort: { disable: true } }
		})
	]);

	const tableViewModel = table.createViewModel(columns);
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

			& :is(.tvl, .supply_apr_latest, .variable_borrow_apr_latest) {
				width: 20%;
				text-align: right;
			}

			& .cta {
				width: 12rem;
			}
		}
	}
</style>
