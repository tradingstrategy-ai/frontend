<script lang="ts">
	import { readable } from 'svelte/store';
	import { createRender, createTable } from 'svelte-headless-table';
	import { addSortBy, addPagination } from 'svelte-headless-table/plugins';
	import EntitySymbol from '$lib/components/EntitySymbol.svelte';
	import DataTable from '$lib/components/datatable/DataTable.svelte';
	import TableRowTarget from '$lib/components/datatable/TableRowTarget.svelte';
	import { formatDollar, formatAmount } from '$lib/helpers/formatters';
	import { getLogoUrl } from '$lib/helpers/assets';

	export let loading = false;
	export let rows: Record<string, any>[] | undefined = undefined;
	export let page = 0;
	export let sort = 'volume_30d';
	export let direction: 'asc' | 'desc' = 'desc';
	export let hideChainIcon = false;

	const tableRows = loading ? new Array(10).fill({}) : rows || [];

	// return a CompareValue object to enable "Unknown 0x…" values to be sorted last
	function getCompareValue(row: Record<string, any>, propertyName: string) {
		return {
			nameOrder: Number(!row.human_readable_name.startsWith('Unknown 0x')),
			value: row[propertyName] as number
		};
	}

	type CompareValue = ReturnType<typeof getCompareValue>;

	// sort "Unknown 0x…" values last; then sort by value
	function compareFn(a: CompareValue, b: CompareValue) {
		return a.nameOrder - b.nameOrder || a.value - b.value;
	}

	const table = createTable(readable(tableRows), {
		sort: addSortBy({
			initialSortKeys: [{ id: sort, order: direction }],
			toggleOrder: ['desc', 'asc']
		}),
		page: addPagination({ initialPageIndex: page })
	});

	const columns = table.createColumns([
		table.column({
			id: 'exchange_name',
			accessor: 'human_readable_name',
			header: 'Exchange',
			cell: ({ value, row: { original } }) =>
				createRender(EntitySymbol, {
					label: original.chain_name,
					logoUrl: hideChainIcon ? undefined : getLogoUrl('blockchain', original.chain_slug)
				}).slot(value)
		}),
		table.column({
			id: 'pair_count',
			accessor: (row) => getCompareValue(row, 'pair_count'),
			header: 'Trading pairs',
			cell: ({ value }) => formatAmount(value.value),
			plugins: { sort: { compareFn } }
		}),
		table.column({
			id: 'volume_30d',
			accessor: (row) => getCompareValue(row, 'usd_volume_30d'),
			header: 'Volume 30d (USD)',
			cell: ({ value }) => formatDollar(value.value),
			plugins: { sort: { compareFn } }
		}),
		table.column({
			id: 'cta',
			header: '',
			accessor: (row) => `/trading-view/${row.chain_slug}/${row.exchange_slug}`,
			cell: ({ value }) => createRender(TableRowTarget, { label: 'View exchange', href: value }),
			plugins: { sort: { disable: true } }
		})
	]);

	const tableViewModel = table.createViewModel(columns);
</script>

<div class="exchange-table">
	<DataTable isResponsive hasPagination targetableRows {loading} {tableViewModel} on:change />
</div>

<style>
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
