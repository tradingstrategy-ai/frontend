<script lang="ts">
	import type { ReserveIndexResponse } from './reserve-client';
	import { writable, type Writable } from 'svelte/store';
	import { createRender, createTable } from 'svelte-headless-table';
	import { addSortBy, addPagination } from 'svelte-headless-table/plugins';
	import { addClickableRows } from '$lib/components/datatable/plugins';
	import { Button, DataTable } from '$lib/components';
	import { formatValue } from '$lib/helpers/formatters';

	export let loading = false;
	export let rows: ReserveIndexResponse['rows'] | undefined = undefined;
	export let totalRowCount = 0;
	export let page = 0;
	export let sort = 'asset_name';
	export let direction: 'asc' | 'desc' = 'asc';
	export let chains: Record<string, string>;

	const tableRows: Writable<ReserveIndexResponse['rows']> = writable([]);
	$: $tableRows = loading ? new Array(10).fill({}) : rows || [];

	const protocols: Record<string, string> = {
		aave_v3: 'Aave v3'
	};

	const table = createTable(tableRows, {
		sort: addSortBy({
			serverSide: true,
			toggleOrder: ['asc', 'desc']
		}),
		page: addPagination({ serverSide: true }),
		clickable: addClickableRows({ id: 'cta' })
	});

	const columns = table.createColumns([
		table.column({
			accessor: 'asset_name',
			header: 'Reserve name',
			cell: ({ value }) => formatValue(value)
		}),
		table.column({
			accessor: 'asset_symbol',
			header: 'Symbol',
			cell: ({ value }) => formatValue(value)
		}),
		table.column({
			id: 'protocol',
			accessor: 'protocol_slug',
			header: 'Protocol',
			cell: ({ value }) => formatValue(protocols[value] ?? value),
			plugins: { sort: { disable: true } }
		}),
		table.column({
			accessor: 'chain_slug',
			header: 'Blockchain',
			cell: ({ value }) => formatValue(chains[value] ?? value),
			plugins: { sort: { disable: true } }
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

	$: $pageIndex = page;
	$: $serverItemCount = totalRowCount;
	$: $sortKeys = [{ id: sort, order: direction }];
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
				width: 15%;
			}

			& .protocol {
				width: 15%;
			}

			& .chain_slug {
				width: 20%;
			}

			& .cta {
				width: 12rem;
			}
		}
	}
</style>
