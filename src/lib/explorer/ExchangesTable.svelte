<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { readable } from 'svelte/store';
	import { createRender, createTable } from 'svelte-headless-table';
	import { addSortBy, addPagination } from 'svelte-headless-table/plugins';
	import { addClickableRows } from '$lib/components/datatable/plugins';
	import { formatDollar, formatAmount } from '$lib/helpers/formatters';
	import { Button, DataTable } from '$lib/components';

	export let rows: Record<string, any>[];
	export let page: number;
	export let sort: string;
	export let direction: 'asc' | 'desc';
	export let loading = true;

	const dispatch = createEventDispatcher();

	const table = createTable(readable(rows), {
		sort: addSortBy({
			initialSortKeys: [{ id: sort, order: direction }],
			toggleOrder: ['desc', 'asc']
		}),
		page: addPagination({ initialPageIndex: page }),
		clickable: addClickableRows({
			href: (row: any) => `/trading-view/${row.chain_slug}/${row.exchange_slug}`
		})
	});

	const columns = table.createColumns([
		table.column({
			id: 'exchange_name',
			accessor: 'human_readable_name',
			header: 'Exchange'
		}),
		table.column({
			accessor: 'chain_name',
			header: 'Blockchain'
		}),
		table.column({
			accessor: 'pair_count',
			header: 'Trading pairs',
			cell: ({ value }) => formatAmount(value)
		}),
		table.column({
			id: 'volume_30d',
			accessor: 'usd_volume_30d',
			header: 'Volume 30d (USD)',
			cell: ({ value }) => formatDollar(value)
		}),
		table.display({
			id: 'cta',
			header: '',
			cell: () => createRender(Button, { label: 'View exchange' }),
			plugins: { sort: { disable: true } }
		})
	]);

	const tableViewModel = table.createViewModel(columns);
	const { pageIndex } = tableViewModel.pluginStates.page;
	const { sortKeys } = tableViewModel.pluginStates.sort;

	$: dispatch('change', {
		page: $pageIndex,
		sort: $sortKeys[0].id,
		direction: $sortKeys[0].order
	});
</script>

<div class="exchange-table">
	<DataTable isResponsive hasPagination {loading} {tableViewModel} />
</div>

<style lang="postcss">
	.exchange-table :global {
		@media (--viewport-md-up) {
			& table {
				table-layout: fixed;
			}

			& .exchange_name {
				width: 30%;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}

			& .chain_name {
				width: 20%;
			}

			& .pair_count {
				width: 18%;
				text-align: right;
			}

			& .volume_30d {
				width: 18%;
				text-align: right;
			}

			& .cta {
				width: 12em;
				text-align: right;
			}
		}
	}
</style>
