<script lang="ts">
	import type { PairIndexResponse } from './pair-client';
	import { createEventDispatcher } from 'svelte';
	import { writable, type Writable } from 'svelte/store';
	import { createRender, createTable } from 'svelte-headless-table';
	import { addSortBy, addPagination } from 'svelte-headless-table/plugins';
	import { addClickableRows } from '$lib/components/datatable/plugins';
	import { formatDollar, formatPriceChange, formatSwapFee } from '$lib/helpers/formatters';
	import { Button, DataTable } from '$lib/components';

	export let data: PairIndexResponse | undefined = undefined;
	export let loading = false;

	const dispatch = createEventDispatcher();

	const rows: Writable<PairIndexResponse['rows']> = writable([]);
	$: $rows = data ? data.rows : loading ? new Array(10).fill({}) : [];

	$: sort = data?.sort || 'volume_30d';
	$: direction = data?.direction || 'desc';

	const table = createTable(rows, {
		sort: addSortBy({
			serverSide: true,
			toggleOrder: ['desc', 'asc']
		}),
		page: addPagination({ serverSide: true }),
		clickable: addClickableRows({ id: 'cta' })
	});

	const valueOrFallback = ({ value }: any) => value || '---';

	const columns = table.createColumns([
		table.column({
			accessor: 'pair_symbol',
			header: 'Trading pair',
			cell: valueOrFallback,
			plugins: { sort: { disable: true } }
		}),
		table.column({
			accessor: 'exchange_name',
			header: 'Exchange',
			cell: valueOrFallback,
			plugins: { sort: { disable: true } }
		}),
		table.column({
			accessor: 'pair_swap_fee',
			header: 'Fee',
			cell: ({ value }) => formatSwapFee(value),
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
			cell: ({ value }) => formatPriceChange(value)
		}),
		table.column({
			id: 'volume_30d', // must match sort key
			accessor: 'usd_volume_30d',
			header: 'Vol 30d USD',
			cell: ({ value }) => formatDollar(value)
		}),
		table.column({
			id: 'liquidity', // must match sort key
			accessor: 'usd_liquidity_latest',
			header: 'Liq USD',
			cell: ({ value }) => formatDollar(value)
		}),
		table.column({
			accessor: 'liquidity_change_24h',
			header: 'Liq Δ 24h',
			cell: ({ value }) => formatPriceChange(value),
			plugins: { sort: { disable: true } }
		}),
		table.column({
			id: 'cta',
			accessor: (row) => `/trading-view/${row.chain_slug}/${row.exchange_slug}/${row.pair_slug}`,
			header: '',
			cell: ({ value }) => createRender(Button, { label: 'View pair', href: value }),
			plugins: { sort: { disable: true } }
		})
	]);

	const tableViewModel = table.createViewModel(columns);
	const { pageIndex, serverItemCount } = tableViewModel.pluginStates.page;
	const { sortKeys } = tableViewModel.pluginStates.sort;

	$: $pageIndex = data?.page || 0;
	$: $serverItemCount = data?.totalRowCount || 0;
	$: $sortKeys = [{ id: sort, order: direction }];

	$: dispatch('change', {
		page: $pageIndex,
		sort: $sortKeys[0].id,
		direction: $sortKeys[0].order
	});
</script>

<div class="pairs-table" data-testid="pairs-table">
	<DataTable isResponsive hasPagination {tableViewModel} />
</div>

<style lang="postcss">
	.pairs-table :global {
		overflow-x: auto;
		overflow-y: hidden;

		@media (--viewport-md-up) {
			& :is(.pair_swap_fee, .usd_price_latest, .price_change_24h, .volume_30d, .liquidity, .liquidity_change_24h) {
				text-align: right;
				&:is(td) {
					overflow: hidden;
					text-overflow: ellipsis;
				}
			}

			& tr:hover td {
				position: relative;
				overflow: visible;
			}

			& .pair_swap_fee {
				max-width: 6rem;
			}
			& .usd_price_latest {
				max-width: 8.5rem;
			}
			& .price_change_24h {
				max-width: 9rem;
			}
			& .volume_30d {
				max-width: 9rem;
			}
			& .liquidity {
				max-width: 7rem;
			}
			& .liquidity_change_24h {
				max-width: 8rem;
			}
		}
	}
</style>
