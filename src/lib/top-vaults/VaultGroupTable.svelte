<script module lang="ts">
	export const sortOptions = {
		keys: ['tvl', 'vault_count', 'name', 'risk'],
		directions: ['desc', 'asc']
	} as const;

	type SortOptions = typeof sortOptions;
</script>

<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import type { VaultGroup } from '$lib/top-vaults/schemas';
	import { page } from '$app/state';
	import { readable } from 'svelte/store';
	import { createTable } from 'svelte-headless-table';
	import { addSortBy, addPagination, addHiddenColumns } from 'svelte-headless-table/plugins';
	import { createRender } from '$lib/components/datatable/utils';
	import DataTable from '$lib/components/datatable/DataTable.svelte';
	import TableRowTarget from '$lib/components/datatable/TableRowTarget.svelte';
	import RiskCell from './RiskCell.svelte';
	import { formatDollar } from '$lib/helpers/formatters';

	type DataTableProps = Omit<ComponentProps<typeof DataTable>, 'tableViewModel'>;

	interface Props extends DataTableProps {
		rows?: VaultGroup[];
		groupLabel: string;
		includeRisk?: boolean;
		page?: number;
		sort?: SortOptions['keys'][number];
		direction?: SortOptions['directions'][number];
	}

	let {
		rows,
		groupLabel,
		includeRisk = false,
		page: pageIndex = 0,
		sort = sortOptions.keys[0],
		direction = sortOptions.directions[0],
		loading = false,
		...restProps
	}: Props = $props();

	const tableRows = loading ? new Array(10).fill({}) : rows || [];

	const table = createTable(readable(tableRows), {
		hide: addHiddenColumns({ initialHiddenColumnIds: includeRisk ? [''] : ['risk'] }),
		sort: addSortBy({
			initialSortKeys: [{ id: sort, order: direction }],
			toggleOrder: ['desc', 'asc']
		}),
		page: addPagination({
			initialPageSize: 50,
			initialPageIndex: pageIndex
		})
	});

	const columns = table.createColumns([
		table.column({
			header: groupLabel,
			accessor: 'name',
			cell: ({ value }) => value,
			plugins: { sort: { invert: true } }
		}),
		table.column({
			id: 'risk',
			header: 'Technical Risk',
			accessor: (row) => ({ risk: row.risk, risk_numeric: row.risk_numeric }),
			cell: ({ value }) => createRender(RiskCell, { risk: value.risk }),
			plugins: {
				sort: {
					getSortValue: (v) => v.risk_numeric ?? Infinity,
					invert: true
				}
			}
		}),
		table.column({
			accessor: 'vault_count',
			header: 'Vaults',
			cell: ({ value }) => value
		}),
		table.column({
			accessor: 'tvl',
			header: 'TVL',
			cell: ({ value }) => formatDollar(value, 2)
		}),
		table.column({
			id: 'cta',
			header: '',
			accessor: (row) => `${page.url.pathname}/${row.slug}`,
			cell: ({ value }) => createRender(TableRowTarget, { size: 'sm', label: 'View protocol', href: value }),
			plugins: { sort: { disable: true } }
		})
	]);

	const tableViewModel = table.createViewModel(columns);
</script>

<div class="vault-protocol-table">
	<DataTable isResponsive hasPagination targetableRows {loading} {tableViewModel} {...restProps} />
</div>

<style>
	.vault-protocol-table {
		/* flip the sort indicator on columns that use inverted sort */
		:global(:is(th.name, th.risk) .icon) {
			rotate: 180deg;
		}

		@media (--viewport-md-up) {
			:global(table) {
				table-layout: fixed;
			}

			:global(:is(th, td)) {
				width: 25%;

				&:not(.name) {
					text-align: right;
				}
			}

			:global(.cta) {
				--button-width: 12rem;
				width: max(calc(24vw), 14rem);
			}

			:global(:has(.risk)) {
				:global(:is(th, td)) {
					width: 20%;
				}

				:global(.name) {
					width: 45%;
				}

				:global(.cta) {
					width: 14rem;
				}
			}
		}
	}
</style>
