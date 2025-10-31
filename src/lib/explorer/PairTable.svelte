<script module lang="ts">
	export const sortOptions = {
		keys: ['tvl', 'price_change_24h', 'volume_30d'],
		directions: ['desc', 'asc']
	} as const;

	type SortOptions = typeof sortOptions;
</script>

<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import type { PairIndexResponse } from './pair-client';
	import { writable } from 'svelte/store';
	import { createTable } from 'svelte-headless-table';
	import { addSortBy, addPagination, addHiddenColumns } from 'svelte-headless-table/plugins';
	import { createRender } from '$lib/components/datatable/utils';
	import Profitability from '$lib/components/Profitability.svelte';
	import DataTable from '$lib/components/datatable/DataTable.svelte';
	import TableRowTarget from '$lib/components/datatable/TableRowTarget.svelte';
	import PairSymbolCell from './PairSymbolCell.svelte';
	import { formatDollar, formatValue } from '$lib/helpers/formatters';
	import { getLogoUrl } from '$lib/helpers/assets';

	type DataTableProps = Omit<ComponentProps<typeof DataTable>, 'tableViewModel'>;

	interface Props extends DataTableProps {
		rows?: PairIndexResponse['rows'];
		page?: number;
		sort?: SortOptions['keys'][number];
		direction?: SortOptions['directions'][number];
		hiddenColumns?: string[];
		hideChainIcon?: boolean;
	}

	let {
		rows,
		page = 0,
		sort = sortOptions.keys[0],
		direction = sortOptions.directions[0],
		hiddenColumns = [],
		hideChainIcon = false,
		loading = false,
		totalRowCount = 0,
		...restProps
	}: Props = $props();

	// set tableRows to real or dummy table rows based on laoding state
	let tableRows: PairIndexResponse['rows'] = $derived(loading ? new Array(10).fill({}) : (rows ?? []));

	// create stores needed by createTable - initial state is required for SSR / to prevent FOUC
	// svelte-ignore state_referenced_locally
	const tableRowsStore = writable(tableRows);
	const serverItemCount = writable(totalRowCount);

	// update the stores when data changes
	$effect(() => {
		tableRowsStore.set(tableRows);
		serverItemCount.set(totalRowCount);
	});

	const table = createTable(tableRowsStore, {
		sort: addSortBy({
			serverSide: true,
			toggleOrder: [...sortOptions.directions],
			initialSortKeys: [{ id: sort, order: direction }]
		}),
		page: addPagination({
			serverSide: true,
			serverItemCount,
			initialPageIndex: page
		}),
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
			cell: ({ value }) => createRender(Profitability, { of: value, boxed: true })
		}),
		table.column({
			id: 'volume_30d', // must match sort key
			accessor: 'usd_volume_30d',
			header: 'Vol 30d',
			cell: ({ value }) => formatDollar(value)
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
			cell: ({ value }) => createRender(TableRowTarget, { label: 'View pair', href: value }),
			plugins: { sort: { disable: true } }
		})
	]);

	const tableViewModel = table.createViewModel(columns);

	const { pageIndex } = tableViewModel.pluginStates.page;
	$effect(() => {
		pageIndex.set(page);
	});

	const { sortKeys } = tableViewModel.pluginStates.sort;
	$effect(() => {
		sortKeys.set([{ id: sort, order: direction }]);
	});

	const { hiddenColumnIds } = tableViewModel.pluginStates.hide;
	$effect(() => {
		hiddenColumnIds.set(hiddenColumns);
	});
</script>

<div class="pairs-table" data-testid="pairs-table">
	<DataTable isResponsive hasPagination targetableRows {loading} {tableViewModel} {totalRowCount} {...restProps} />
</div>

<style>
	.pairs-table {
		overflow-x: auto;
		overflow-y: hidden;

		@media (--viewport-md-up) {
			:global(:is(.usd_price_latest, .price_change_24h, .volume_30d, .tvl)) {
				max-width: 12ch;
				text-align: right;
				overflow: hidden;
				text-overflow: ellipsis;
			}

			:global(.pair_symbol) {
				min-width: 12rem;
			}

			:global(.exchange_name) {
				min-width: 6rem;
				white-space: nowrap;
			}

			:global(.price_change_24h) {
				padding: 0 var(--space-xs);
				font: var(--f-ui-sm-medium);
				letter-spacing: var(--f-ui-sm-spacing, normal);
			}
		}

		@media (--viewport-sm-down) {
			:global(.price_change_24h) {
				width: fit-content;
				font: var(--f-ui-md-medium);
				letter-spacing: var(--f-ui-md-spacing, normal);
			}
		}
	}
</style>
