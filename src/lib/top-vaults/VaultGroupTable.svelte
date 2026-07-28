<script module lang="ts">
	export const sortOptions = {
		keys: ['tvl', 'avg_apy', 'vault_count', 'name', 'risk', 'core3_risk'],
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
	import { UNKNOWN_VAULT_PROTOCOL_SLUG } from '$lib/top-vaults/helpers';
	import AvgApyHeader from './AvgApyHeader.svelte';
	import VaultGroupNameCell from './VaultGroupNameCell.svelte';
	import RiskCell from './RiskCell.svelte';
	import Core3RiskCell from './Core3RiskCell.svelte';
	import { formatDollar, formatPercent } from '$lib/helpers/formatters';

	type DataTableProps = Omit<ComponentProps<typeof DataTable>, 'tableViewModel'>;

	interface Props extends DataTableProps {
		rows?: VaultGroup[];
		groupLabel: string;
		includeRisk?: boolean;
		includeCore3Risk?: boolean;
		includeFullName?: boolean;
		/** Widen the name column for groups with long display names (e.g. curators) */
		wideName?: boolean;
		getLogoHref?: (slug: string) => string | undefined;
		page?: number;
		sort?: SortOptions['keys'][number];
		direction?: SortOptions['directions'][number];
		getHref?: (slug: string) => string | undefined;
		getWarningLabel?: (row: VaultGroup) => string | undefined;
	}

	let {
		rows,
		groupLabel,
		includeRisk = false,
		includeCore3Risk = false,
		includeFullName = false,
		wideName = false,
		getLogoHref,
		page: pageIndex = 0,
		sort = sortOptions.keys[0],
		direction = sortOptions.directions[0],
		getHref = (slug: string) => `${page.url.pathname}/${slug}`,
		getWarningLabel,
		loading = false,
		...restProps
	}: Props = $props();

	let tableRows = $derived(loading ? new Array(10).fill({}) : rows || []);

	// svelte-ignore state_referenced_locally
	const tableRowsStore = writable(tableRows);

	$effect(() => {
		tableRowsStore.set(tableRows);
	});

	function getTableRowClass(row: unknown) {
		return getWarningLabel?.(row as VaultGroup) ? 'depegged' : undefined;
	}

	const hiddenColumns = [
		...(includeRisk ? [] : ['risk']),
		...(includeCore3Risk ? [] : ['core3_risk']),
		...(includeFullName ? [] : ['full_name'])
	];

	// svelte-ignore state_referenced_locally
	const table = createTable(tableRowsStore, {
		hide: addHiddenColumns({ initialHiddenColumnIds: hiddenColumns.length ? hiddenColumns : [''] }),
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
			cell: ({ value }) =>
				createRender(VaultGroupNameCell, {
					label: value.name,
					logoUrl: getLogoHref?.(value.slug),
					showPlaceholder: value.slug === UNKNOWN_VAULT_PROTOCOL_SLUG && !getLogoHref?.(value.slug)
				}),
			plugins: { sort: { getSortValue: (v) => v.name, invert: true } }
		}),
		table.column({
			id: 'full_name',
			header: 'Name',
			accessor: (row) => ({ fullName: row.fullName, warningLabel: getWarningLabel?.(row) }),
			cell: ({ value }) =>
				value.fullName || value.warningLabel
					? createRender(VaultGroupNameCell, {
							label: value.fullName ?? '',
							warningLabel: value.warningLabel
						})
					: '',
			plugins: { sort: { disable: true } }
		}),
		table.column({
			id: 'core3_risk',
			header: 'CORE3',
			accessor: (row) => ({ rating: row.core3_rating ?? null, slug: row.slug, score: row.core3_score ?? null }),
			cell: ({ value }) => createRender(Core3RiskCell, { rating: value.rating, slug: value.slug }),
			plugins: {
				sort: {
					// lower score = better rating; unrated protocols sort last
					getSortValue: (v) => v.score ?? Infinity,
					invert: true
				}
			}
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
			header: createRender(AvgApyHeader, { label: 'Avg. APY%' }),
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
			cell: ({ value }) =>
				value ? createRender(TableRowTarget, { size: 'sm', label: 'View vaults', href: value }) : '',
			plugins: { sort: { disable: true } }
		})
	]);

	const tableViewModel = table.createViewModel(columns);
</script>

<div class="vault-protocol-table" class:wide-name={wideName}>
	<DataTable
		isResponsive
		hasPagination
		targetableRows
		{loading}
		{tableViewModel}
		getRowClass={getTableRowClass}
		{...restProps}
	/>
</div>

<style>
	.vault-protocol-table {
		/* flip the sort indicator on columns that use inverted sort */
		:global(:is(th.name, th.risk, th.core3_risk) .icon) {
			rotate: 180deg;
		}

		/* hide full_name column on mobile */
		:global(:is(th.full_name, td.full_name)) {
			@media (--viewport-sm-down) {
				display: none;
			}
		}

		/* hide the CORE3 cell in the mobile card view when a protocol has no rating,
		   so an empty "CORE3 –" row is not shown */
		:global(td.core3_risk:has(.empty)) {
			@media (--viewport-sm-down) {
				display: none;
			}
		}

		@media (--viewport-md-up) {
			:global(table) {
				table-layout: fixed;
			}

			:global(:is(th, td)) {
				width: 20%;

				&:not(:is(.name, .risk, .core3_risk, .full_name)) {
					text-align: right;
				}
			}

			:global(.full_name) {
				width: 20%;
			}

			:global(.cta) {
				--button-width: 10rem;
				width: max(calc(20vw), 12rem);
			}

			/* layout with a leading rating column (technical risk and/or CORE3); the
			   percentage widths must sum to 100% so the cells fill the table edge-to-edge */
			:global(:has(:is(.risk, .core3_risk))) {
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

			&.wide-name {
				:global(:is(th, td):not(.name, .cta)) {
					width: 16%;
				}

				:global(.name) {
					width: 36%;
				}
			}
		}

		@media (--viewport-sm-down) {
			:global(table.datatable.responsive) {
				--border-spacing: 0;
				gap: 2px;
				margin-block: var(--space-xxs);
			}

			:global(table.datatable.responsive .mobile-sort-select th) {
				padding: var(--space-xxs) 0;
			}

			:global(table.datatable.responsive tbody tr) {
				grid-template-columns: 1fr 1fr;
				gap: var(--space-xxs) var(--space-sm);
				padding: var(--space-xs);
			}

			:global(table.datatable.responsive tbody tr[data-row-index]::before) {
				top: var(--space-xs);
				left: calc(var(--space-xs) + 2rem + var(--space-xs));
				font: var(--f-ui-md-bold);
				line-height: 2rem;
				pointer-events: none;
			}

			:global(table.datatable.responsive tbody tr td.name) {
				grid-column: 1 / -1;
				align-items: center;
				min-height: 2rem;
				padding-inline-start: calc(2rem + var(--space-xs) + 2.5rem);
				font: var(--f-ui-md-bold);
				line-height: 1.1;
			}

			:global(table.datatable.responsive tbody tr td) {
				display: flex;
				align-items: baseline;
				gap: var(--space-xxs);
				min-width: 0;
				padding: 0;
				font: var(--f-ui-sm-medium);
				line-height: 1.1;
				word-break: normal;
			}

			:global(table.datatable.responsive tbody tr td.name .entity-symbol .logo),
			:global(table.datatable.responsive tbody tr td.name .entity-symbol .placeholder-logo) {
				position: absolute;
				top: var(--space-xs);
				left: var(--space-xs);
				width: 2rem;
				height: 2rem;
				object-fit: contain;
			}

			:global(table.datatable.responsive tbody tr td.name .entity-symbol),
			:global(table.datatable.responsive tbody tr td.name .entity-symbol .label),
			:global(table.datatable.responsive tbody tr td.name .group-name) {
				min-width: 0;
			}

			:global(table.datatable.responsive tbody tr td.name .group-name > span:last-child) {
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			:global(table.datatable.responsive tbody tr td.name::before) {
				display: none;
			}

			:global(table.datatable.responsive tbody tr td:not(.cta)::before) {
				flex: none;
				font: var(--f-ui-xs-roman);
				line-height: 1.1;
			}

			:global(table.datatable.responsive tbody tr td.cta) {
				grid-column: 1 / -1;
				padding: 0;
			}

			:global(table.datatable.responsive tbody tr td .row-link) {
				padding-right: 0;
				font: var(--f-ui-sm-medium);
				line-height: 1.1;
			}
		}
	}

	.vault-protocol-table :global(tr.depegged td),
	.vault-protocol-table :global(tr.depegged td *) {
		color: var(--c-bearish) !important;
	}
</style>
