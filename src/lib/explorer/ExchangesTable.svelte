<script lang="ts">
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

	const table = createTable(readable(rows), {
		sort: addSortBy({
			initialSortKeys: [{ id: sort, order: direction }],
			toggleOrder: ['desc', 'asc']
		}),
		page: addPagination({ initialPageIndex: page }),
		clickable: addClickableRows({ id: 'cta' })
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
		table.column({
			id: 'cta',
			header: '',
			accessor: (row) => `/trading-view/${row.chain_slug}/${row.exchange_slug}`,
			cell: ({ value }) => createRender(Button, { label: 'View exchange', href: value }),
			plugins: { sort: { disable: true } }
		})
	]);

	const tableViewModel = table.createViewModel(columns);
</script>

<div class="exchange-table">
	<DataTable isResponsive hasPagination {tableViewModel} on:change />
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
