<script lang="ts">
	import { readable } from 'svelte/store';
	import { createRender, createTable } from 'svelte-headless-table';
	import { addSortBy, addPagination } from 'svelte-headless-table/plugins';
	import { addClickableRows } from '$lib/components/datatable/plugins';
	import { formatDollar, formatAmount } from '$lib/helpers/formatters';
	import { Button, DataTable, EntitySymbol } from '$lib/components';

	export let loading = false;
	export let rows: Record<string, any>[] | undefined = undefined;
	export let page = 0;
	export let sort = 'volume_30d';
	export let direction: 'asc' | 'desc' = 'desc';
	export let hideChainIcon = false;

	const tableRows = loading ? new Array(10).fill({}) : rows || [];

	const table = createTable(readable(tableRows), {
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
			header: 'Exchange',
			cell: ({ value, row: { original } }) =>
				createRender(EntitySymbol, {
					type: 'blockchain',
					slug: hideChainIcon ? undefined : original.chain_slug,
					label: original.chain_name
				}).slot(value)
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
			cell: ({ value }) => createRender(Button, { label: 'View exchange', href: value, size: 'sm' }),
			plugins: { sort: { disable: true } }
		})
	]);

	const tableViewModel = table.createViewModel(columns);
</script>

<div class="exchange-table">
	<DataTable isResponsive hasPagination {loading} {tableViewModel} on:change />
</div>

<style lang="postcss">
	.exchange-table :global {
		.exchange_name * {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		@media (--viewport-sm-down) {
			.exchange_name {
				grid-column: 1/-1;
			}
		}

		@media (--viewport-md-up) {
			table {
				table-layout: fixed;
			}

			.exchange_name {
				width: 45%;
			}

			.pair_count {
				width: 25%;
				text-align: right;
			}

			.volume_30d {
				width: 30%;
				text-align: right;
			}

			.cta {
				width: 14rem;
				padding-left: 2em;
			}
		}
	}
</style>
