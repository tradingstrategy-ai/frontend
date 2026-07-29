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
			id: 'index',
			header: '',
			accessor: () => '',
			plugins: { sort: { disable: true } }
		}),
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

<div class="vault-protocol-table" class:wide-name={wideName} style:--rank-offset={pageIndex * 150}>
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
				counter-reset: group-rank var(--rank-offset);
			}

			:global(:is(th, td)) {
				width: 16%;

				&:not(:is(.index, .name, .risk, .core3_risk, .full_name)) {
					text-align: right;
				}
			}

			:global(.index) {
				box-sizing: border-box;
				width: 2.75rem;
				min-width: 2.75rem;
				max-width: 2.75rem;
				padding-inline: var(--space-xs);
				text-align: center;
			}

			:global(td.index) {
				counter-increment: group-rank;
				color: #6b7280;

				&::before {
					content: '#' counter(group-rank);
				}
			}

			:global(tr[data-row-index='1'] td.index) {
				color: #d4af37;
			}

			:global(tr[data-row-index='2'] td.index) {
				color: #c0c0c0;
			}

			:global(tr[data-row-index='3'] td.index) {
				color: #cd7f32;
			}

			:global(.name) {
				width: 32%;
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
				:global(:is(th, td):not(.index)) {
					width: 15%;
				}

				:global(.name) {
					width: 29%;
				}

				:global(.cta) {
					width: 12rem;
				}
			}

			&.wide-name {
				:global(:is(th, td):not(.index, .name, .cta)) {
					width: 15%;
				}

				:global(.name) {
					width: 35%;
				}
			}
		}

		@media (--viewport-sm-down) {
			:global(table.datatable.responsive :is(th.index, td.index)) {
				display: none;
			}

			:global(table.datatable.responsive) {
				--border-spacing: 0;
				gap: 0.375rem;
				margin-block: var(--space-xxs);
			}

			:global(table.datatable.responsive .mobile-sort-select th) {
				padding: var(--space-xxs) 0;
			}

			:global(table.datatable.responsive tbody tr) {
				grid-template-columns: calc(2.5rem + 0.5rem + 2.5rem + 1rem) max-content max-content minmax(0, 1fr);
				gap: 0 0.5rem;
				padding: 0.75rem 0.875rem;
				border-radius: 0.75rem;
			}

			:global(table.datatable.responsive tbody tr::after) {
				content: '›';
				position: absolute;
				top: 0.75rem;
				right: 0.875rem;
				font: var(--f-ui-xl-medium);
				line-height: 2.5rem;
				color: var(--c-text-extra-light);
				pointer-events: none;
			}

			:global(table.datatable.responsive tbody tr[data-row-index]::before) {
				top: 0.75rem;
				left: calc(0.875rem + 1.25rem);
				transform: translateX(-50%);
				font: var(--f-ui-md-bold);
				line-height: 2.5rem;
				color: var(--c-text);
				pointer-events: none;
			}

			:global(table.datatable.responsive tbody tr td.name) {
				grid-column: 1 / -1;
				align-items: center;
				min-height: 2.5rem;
				padding-inline: calc(2.5rem + 0.5rem + 2.5rem + 1.5rem) 2.25rem;
				font: var(--f-ui-lg-bold);
				line-height: 1.1;
			}

			:global(table.datatable.responsive tbody tr td) {
				display: flex;
				align-items: baseline;
				gap: var(--space-xxs);
				min-width: 0;
				padding: 0;
				font: var(--f-ui-xs-roman);
				line-height: 1.2;
				color: var(--c-text);
				white-space: nowrap;
				word-break: normal;
			}

			:global(table.datatable.responsive tbody tr td:not(.name)::before),
			:global(table.datatable.responsive tbody tr td:not(.name)::after) {
				color: var(--c-text-light);
			}

			:global(table.datatable.responsive tbody tr td.name .entity-symbol .logo),
			:global(table.datatable.responsive tbody tr td.name .entity-symbol .placeholder-logo) {
				position: absolute;
				top: calc(0.75rem + 0.625rem);
				left: calc(0.875rem + 2.5rem + 0.5rem);
				width: 2.5rem;
				height: 2.5rem;
				object-fit: contain;
			}

			:global(table.datatable.responsive tbody tr td.name .entity-symbol),
			:global(table.datatable.responsive tbody tr td.name .entity-symbol .label),
			:global(table.datatable.responsive tbody tr td.name .group-name) {
				min-width: 0;
				max-width: 100%;
			}

			:global(table.datatable.responsive tbody tr td.name .entity-symbol) {
				width: 100%;
			}

			:global(table.datatable.responsive tbody tr td.name .group-name > span:last-child) {
				min-width: 0;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			:global(table.datatable.responsive tbody tr td.name::before) {
				display: none;
			}

			:global(table.datatable.responsive tbody tr td.core3_risk) {
				display: none;
			}

			:global(table.datatable.responsive tbody tr td:not(.cta)::before) {
				flex: none;
				font: inherit;
				line-height: inherit;
			}

			:global(table.datatable.responsive tbody tr td.vault_count) {
				grid-column: 2;
			}

			:global(table.datatable.responsive tbody tr td.vault_count::before) {
				content: 'vaults';
				order: 2;
			}

			:global(table.datatable.responsive tbody tr td.avg_apy) {
				grid-column: 3;
			}

			:global(table.datatable.responsive tbody tr td.tvl) {
				grid-column: 4;
			}

			:global(table.datatable.responsive tbody tr td.avg_apy::before),
			:global(table.datatable.responsive tbody tr td.tvl::before) {
				content: '·';
			}

			:global(table.datatable.responsive tbody tr td.avg_apy::after) {
				content: 'APY';
			}

			:global(table.datatable.responsive tbody tr td.tvl::after) {
				content: 'TVL';
			}

			:global(table.datatable.responsive tbody tr td.cta) {
				display: contents;
			}

			:global(table.datatable.responsive tbody tr td .row-link) {
				display: none;
			}

			@media (width < 480px) {
				:global(table.datatable.responsive tbody tr) {
					grid-template-columns: calc(2.5rem + 0.5rem + 2.5rem + 1rem) max-content minmax(0, 1fr);
				}

				:global(table.datatable.responsive tbody tr td.avg_apy) {
					grid-column: 3;
				}

				:global(table.datatable.responsive tbody tr td.tvl) {
					grid-column: 2 / -1;
				}

				:global(table.datatable.responsive tbody tr td.tvl::before) {
					display: none;
				}
			}
		}
	}

	.vault-protocol-table :global(tr.depegged td),
	.vault-protocol-table :global(tr.depegged td *) {
		color: var(--c-bearish) !important;
	}
</style>
