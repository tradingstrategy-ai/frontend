<script lang="ts">
	import type { TokenIndexResponse } from './token-client';
	import { writable, type Writable } from 'svelte/store';
	import { createRender, createTable } from 'svelte-headless-table';
	import { addSortBy, addPagination } from 'svelte-headless-table/plugins';
	import { addClickableRows } from '$lib/components/datatable/plugins';
	import { formatDollar, formatValue } from '$lib/helpers/formatters';
	import { Button, DataTable } from '$lib/components';

	export let loading = false;
	export let rows: TokenIndexResponse['rows'] | undefined = undefined;
	export let totalRowCount = 0;
	export let page = 0;
	export let sort = 'volume_30d';
	export let direction: 'asc' | 'desc' = 'desc';

	const tableRows: Writable<TokenIndexResponse['rows']> = writable([]);
	$: $tableRows = loading ? new Array(10).fill({}) : rows || [];

	const table = createTable(tableRows, {
		sort: addSortBy({
			serverSide: true,
			toggleOrder: ['desc', 'asc']
		}),
		page: addPagination({ serverSide: true }),
		clickable: addClickableRows({ id: 'cta' })
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
			cell: ({ value }) => createRender(Button, { label: 'View token', href: value, size: 'sm' }),
			plugins: { sort: { disable: true } }
		})
	]);

	const tableViewModel = table.createViewModel(columns);
	const { pageIndex, serverItemCount } = tableViewModel.pluginStates.page;
	const { sortKeys } = tableViewModel.pluginStates.sort;

	$: $pageIndex = page;
	$: $serverItemCount = totalRowCount;
	$: $sortKeys = [{ id: sort, order: direction }];
</script>

<div class="token-table" data-testid="token-table">
	<DataTable isResponsive hasPagination {loading} {tableViewModel} on:change />
</div>

<style lang="postcss">
	.token-table :global {
		@media (--viewport-md-up) {
			table {
				table-layout: fixed;
			}

			.name {
				width: 35%;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}

			.symbol {
				width: 15%;
			}

			.volume_24h {
				width: 25%;
				text-align: right;
			}

			.liquidity_latest {
				width: 25%;
				text-align: right;
			}

			.cta {
				width: 11rem;
				padding-left: 1rem;
			}
		}
	}
</style>
