<script lang="ts">
	import type { PairIndexResponse } from './pair-client';
	import { type Writable, writable } from 'svelte/store';
	import { createRender, createTable } from 'svelte-headless-table';
	import { addSortBy, addPagination, addHiddenColumns } from 'svelte-headless-table/plugins';
	import { addClickableRows } from '$lib/components/datatable/plugins';
	import { Button, DataTable, UpDownCell } from '$lib/components';
	import PairSymbolCell from './PairSymbolCell.svelte';
	import { formatDollar, formatPriceChange, formatValue } from '$lib/helpers/formatters';
	import { getLogoUrl } from '$lib/helpers/assets';

	export let loading = false;
	export let rows: PairIndexResponse['rows'] | undefined = undefined;
	export let totalRowCount = 0;
	export let page = 0;
	export let sort = 'tvl';
	export let direction: 'asc' | 'desc' = 'desc';
	export let hiddenColumns: string[] = [];
	export let hideChainIcon = false;

	const tableRows: Writable<PairIndexResponse['rows']> = writable([]);
	$: tableRows.set(loading ? new Array(10).fill({}) : rows || []);

	const serverItemCount = writable(0);
	$: serverItemCount.set(totalRowCount);

	const table = createTable(tableRows, {
		sort: addSortBy({
			serverSide: true,
			toggleOrder: ['desc', 'asc']
		}),
		page: addPagination({ serverSide: true, serverItemCount }),
		clickable: addClickableRows({ id: 'cta' }),
		hide: addHiddenColumns({ initialHiddenColumnIds: hiddenColumns })
	});

	const columns = table.createColumns([
		table.column({
			id: 'pair_symbol',
			accessor: (row) => row,
			header: 'Trading pair',
			cell: ({ value: row }: { value: any }) =>
				createRender(PairSymbolCell, {
					symbol: row.pair_symbol,
					swapFee: row.pair_swap_fee,
					chainName: row.chain_name,
					logoUrl: hideChainIcon ? undefined : getLogoUrl('blockchain', row.chain_slug)
				}),
			plugins: { sort: { disable: true } }
		}),
		table.column({
			accessor: 'exchange_name',
			header: 'Exchange',
			cell: ({ value }) => formatValue(value),
			plugins: { sort: { disable: true } }
		}),
		table.column({
			accessor: 'usd_price_latest',
			header: 'Price USD',
			cell: ({ value }) => formatDollar(value),
			plugins: { sort: { disable: true } }
		}),
		table.column({
			accessor: 'price_change_24h', // must match sort key
			header: 'Price Δ 24h',
			cell: ({ value }) => createRender(UpDownCell, { value, formatter: formatPriceChange })
		}),
		table.column({
			id: 'volume_30d', // must match sort key
			accessor: 'usd_volume_30d',
			header: 'Vol 30d',
			cell: ({ value }) => formatDollar(value)
		}),
		table.column({
			id: 'liquidity', // must match sort key
			accessor: 'usd_liquidity_latest',
			header: 'Liquidity',
			cell: ({ value }) => formatDollar(value)
		}),
		table.column({
			accessor: 'liquidity_change_24h',
			header: 'Liq Δ 24h',
			cell: ({ value }) => createRender(UpDownCell, { value, formatter: formatPriceChange }),
			plugins: { sort: { disable: true } }
		}),
		table.column({
			id: 'tvl', // must match sort key
			accessor: 'pair_tvl',
			header: 'TVL',
			cell: ({ value }) => formatDollar(value)
		}),
		table.column({
			id: 'cta',
			accessor: (row) => `/trading-view/${row.chain_slug}/${row.exchange_slug}/${row.pair_slug}`,
			header: '',
			cell: ({ value }) => createRender(Button, { label: 'View pair', href: value, size: 'sm' }),
			plugins: { sort: { disable: true } }
		})
	]);

	const tableViewModel = table.createViewModel(columns);
	const { pageIndex } = tableViewModel.pluginStates.page;
	const { sortKeys } = tableViewModel.pluginStates.sort;
	const { hiddenColumnIds } = tableViewModel.pluginStates.hide;

	$: $pageIndex = page;
	$: $sortKeys = [{ id: sort, order: direction }];
	$: $hiddenColumnIds = hiddenColumns;
</script>

<div class="pairs-table" data-testid="pairs-table">
	<DataTable isResponsive hasPagination {loading} {tableViewModel} {totalRowCount} on:change />
</div>

<style>
	.pairs-table :global {
		overflow-x: auto;
		overflow-y: hidden;

		@media (--viewport-md-up) {
			tr:hover td {
				position: relative;
				overflow: visible;
			}

			:is(.usd_price_latest, .price_change_24h, .volume_30d, .liquidity, .liquidity_change_24h, .tvl) {
				max-width: 12ch;
				text-align: right;
				overflow: hidden;
				text-overflow: ellipsis;
			}

			.pair_symbol {
				min-width: 12rem;
			}

			.exchange_name {
				min-width: 6rem;
				white-space: nowrap;
			}

			.price_change_24h {
				padding: 0 var(--space-xs);
			}
		}
	}
</style>
