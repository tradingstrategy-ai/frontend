<script module lang="ts">
	export const sortOptions = {
		keys: ['volume_30d', 'pair_count', 'exchange_name'],
		directions: ['desc', 'asc']
	} as const;

	type SortOptions = typeof sortOptions;
</script>

<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { readable } from 'svelte/store';
	import { createTable } from 'svelte-headless-table';
	import { addSortBy, addPagination } from 'svelte-headless-table/plugins';
	import { createRender } from '$lib/components/datatable/utils';
	import EntitySymbol from '$lib/components/EntitySymbol.svelte';
	import DataTable from '$lib/components/datatable/DataTable.svelte';
	import TableRowTarget from '$lib/components/datatable/TableRowTarget.svelte';
	import { formatDollar, formatAmount } from '$lib/helpers/formatters';
	import { getLogoUrl } from '$lib/helpers/assets';

	type DataTableProps = Omit<ComponentProps<typeof DataTable>, 'tableViewModel'>;

	interface Props extends DataTableProps {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		rows?: Record<string, any>[];
		page?: number;
		sort?: SortOptions['keys'][number];
		direction?: SortOptions['directions'][number];
		hideChainIcon?: boolean;
	}

	let {
		rows,
		page = 0,
		sort = sortOptions.keys[0],
		direction = sortOptions.directions[0],
		loading = false,
		hideChainIcon = false,
		...restProps
	}: Props = $props();

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
	<DataTable isResponsive hasPagination targetableRows {loading} {tableViewModel} {...restProps} />
</div>

<style>
	.exchange-table {
		:global(.exchange_name *) {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		@media (--viewport-sm-down) {
			:global(.exchange_name) {
				grid-column: 1/-1;
			}
		}

		@media (--viewport-md-up) {
			:global(table) {
				table-layout: fixed;
			}

			:global(.exchange_name) {
				width: 45%;
			}

			:global(.pair_count) {
				width: 25%;
				text-align: right;
			}

			:global(.volume_30d) {
				width: 30%;
				text-align: right;
			}

			:global(.cta) {
				width: 14rem;
				padding-left: 2em;
			}
		}
	}
</style>
