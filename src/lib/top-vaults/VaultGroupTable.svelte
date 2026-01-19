<script module lang="ts">
	export const sortOptions = {
		keys: ['tvl', 'avg_apy', 'vault_count', 'name', 'risk'],
		directions: ['desc', 'asc']
	} as const;

	type SortOptions = typeof sortOptions;
</script>

<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import type { VaultGroup } from '$lib/top-vaults/schemas';
	import { page } from '$app/state';
	import { writable } from 'svelte/store';
	import { createTable } from 'svelte-headless-table';
	import { addSortBy, addPagination, addHiddenColumns } from 'svelte-headless-table/plugins';
	import { createRender } from '$lib/components/datatable/utils';
	import DataTable from '$lib/components/datatable/DataTable.svelte';
	import TableRowTarget from '$lib/components/datatable/TableRowTarget.svelte';
	import EntitySymbol from '$lib/components/EntitySymbol.svelte';
	import RiskCell from './RiskCell.svelte';
	import { formatDollar, formatPercent } from '$lib/helpers/formatters';

	type DataTableProps = Omit<ComponentProps<typeof DataTable>, 'tableViewModel'>;

	interface Props extends DataTableProps {
		rows?: VaultGroup[];
		groupLabel: string;
		includeRisk?: boolean;
		getLogoHref?: (slug: string) => string | undefined;
		page?: number;
		sort?: SortOptions['keys'][number];
		direction?: SortOptions['directions'][number];
		getHref?: (slug: string) => string;
	}

	let {
		rows,
		groupLabel,
		includeRisk = false,
		getLogoHref,
		page: pageIndex = 0,
		sort = sortOptions.keys[0],
		direction = sortOptions.directions[0],
		getHref = (slug: string) => `${page.url.pathname}/${slug}`,
		loading = false,
		...restProps
	}: Props = $props();

	let tableRows = $derived(loading ? new Array(10).fill({}) : rows || []);

	// svelte-ignore state_referenced_locally
	const tableRowsStore = writable(tableRows);

	$effect(() => {
		tableRowsStore.set(tableRows);
	});

	// svelte-ignore state_referenced_locally
	const table = createTable(tableRowsStore, {
		hide: addHiddenColumns({ initialHiddenColumnIds: includeRisk ? [''] : ['risk'] }),
		sort: addSortBy({
			initialSortKeys: [{ id: sort, order: direction }],
			toggleOrder: ['desc', 'asc']
		}),
		page: addPagination({
			initialPageSize: 150,
			initialPageIndex: pageIndex
		})
	});

	// svelte-ignore state_referenced_locally
	const columns = table.createColumns([
		table.column({
			id: 'name',
			header: groupLabel,
			accessor: (row) => ({ name: row.name, slug: row.slug }),
			// prettier-ignore
			cell: ({ value }) => getLogoHref
					? createRender(EntitySymbol, { label: value.name, logoUrl: getLogoHref(value.slug) })
					: value.name,
			plugins: { sort: { getSortValue: (v) => v.name, invert: true } }
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
			accessor: 'avg_apy',
			header: 'Avg. 1M APY %',
			cell: ({ value }) => formatPercent(value)
		}),
		table.column({
			accessor: 'tvl',
			header: 'TVL',
			cell: ({ value }) => formatDollar(value, 2)
		}),
		table.column({
			id: 'cta',
			header: '',
			accessor: (row) => getHref(row.slug),
			cell: ({ value }) => createRender(TableRowTarget, { size: 'sm', label: 'View vaults', href: value }),
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
				width: 20%;

				&:not(:is(.name, .risk)) {
					text-align: right;
				}
			}

			:global(.cta) {
				--button-width: 10rem;
				width: max(calc(20vw), 12rem);
			}

			:global(:has(.risk)) {
				:global(:is(th, td)) {
					width: 16%;
				}

				:global(.name) {
					width: 36%;
				}

				:global(.cta) {
					width: 12rem;
				}
			}
		}
	}
</style>
