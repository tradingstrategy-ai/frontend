<script lang="ts">
	import type { PositionStatus } from 'trade-executor/schemas/position';
	import type { TradingPositionInfo } from 'trade-executor/models/position-info';
	import { writable } from 'svelte/store';
	import { createTable, createRender } from 'svelte-headless-table';
	import { addSortBy, addTableFilter, addColumnOrder, addPagination } from 'svelte-headless-table/plugins';
	import { formatDollar } from '$lib/helpers/formatters';
	import Profitability from '$lib/components/Profitability.svelte';
	import Timestamp from '$lib/components/Timestamp.svelte';
	import DataTable from '$lib/components/datatable/DataTable.svelte';
	import TableRowTarget from '$lib/components/datatable/TableRowTarget.svelte';
	import TradingDescription from 'trade-executor/components/TradingDescription.svelte';
	import RemarksCell from './RemarksCell.svelte';

	export let admin = false;
	export let positions: TradingPositionInfo[];
	export let status: PositionStatus;
	export let page = 0;
	export let sort: string;
	export let direction: 'asc' | 'desc';
	export let filter = '';
	export let hasSearch = false;
	export let hasPagination = false;
	export let hiddenPositions: number[] = [];

	const positionsStore = writable([] as TradingPositionInfo[]);
	$: positionsStore.set(positions);

	const statusColumns = {
		open: ['description', 'flags', 'profit', 'current_value', 'opened_at', 'cta'],
		closed: ['description', 'flags', 'profit', 'value_at_open', 'closed_at', 'cta'],
		frozen: ['description', 'flags', 'frozen_on', 'frozen_value', 'frozen_at', 'cta']
	};

	const table = createTable(positionsStore, {
		colOrder: addColumnOrder({ hideUnspecifiedColumns: true }),
		tableFilter: addTableFilter({
			initialFilterValue: filter,
			fn: ({ filterValue, value }) => value.toLocaleLowerCase().includes(filterValue.toLocaleLowerCase())
		}),
		sort: addSortBy({
			initialSortKeys: [{ id: sort, order: direction }],
			toggleOrder: ['desc', 'asc']
		}),
		page: addPagination({
			initialPageIndex: page,
			initialPageSize: 20
		})
	});

	const tableColumns = table.createColumns([
		table.column({
			header: 'Id',
			accessor: 'position_id'
		}),
		table.column({
			header: 'Position',
			id: 'description',
			accessor: ({ position_id, pair, isTest }) => ({
				class: hiddenPositions.includes(position_id) ? 'hidden' : '',
				label: pair.symbol,
				modifier: pair.kindShortLabel,
				isTest,
				toString: () => `${pair.symbol} ${pair.kindShortLabel} ${isTest ? 'test' : ''}`
			}),
			cell: ({ value }) => createRender(TradingDescription, value)
		}),
		table.column({
			header: 'Remarks',
			id: 'flags',
			accessor: (position) => position,
			cell: ({ value }) =>
				createRender(RemarksCell, {
					admin,
					position: value,
					baseUrl: `./${status}-positions/${value.position_id}`,
					isHidden: hiddenPositions.includes(value.position_id)
				}),
			plugins: { sort: { disable: true } }
		}),
		table.column({
			header: 'Profitability',
			id: 'profit',
			accessor: 'profitability',
			cell: ({ value }) => createRender(Profitability, { of: value, boxed: true })
		}),
		table.column({
			header: 'Frozen on',
			id: 'frozen_on',
			accessor: (position) => position.lastTrade?.directionLabel
		}),
		table.column({
			header: 'Value',
			id: 'current_value',
			accessor: 'currentValue',
			cell: ({ value }) => formatDollar(value)
		}),
		table.column({
			header: 'Value',
			id: 'value_at_open',
			accessor: 'valueAtOpen',
			cell: ({ value }) => formatDollar(value)
		}),
		table.column({
			header: 'Value',
			id: 'frozen_value',
			accessor: (position) => position.lastTrade?.planned_reserve,
			cell: ({ value }) => formatDollar(value)
		}),
		table.column({
			header: 'Opened',
			accessor: 'opened_at',
			cell: ({ value }) => createRender(Timestamp, { date: value, withTime: true })
		}),
		table.column({
			header: 'Closed',
			accessor: 'closed_at',
			cell: ({ value }) => createRender(Timestamp, { date: value, withTime: true })
		}),
		table.column({
			header: 'Frozen at',
			accessor: 'frozen_at',
			cell: ({ value }) => createRender(Timestamp, { date: value, withTime: true })
		}),
		table.column({
			header: '',
			id: 'cta',
			accessor: ({ position_id }) => `./${status}-positions/${position_id}`,
			cell: ({ value }) => createRender(TableRowTarget, { href: value, size: 'xs' }),
			plugins: { sort: { disable: true } }
		})
	]);

	const tableViewModel = table.createViewModel(tableColumns);
	const { pluginStates } = tableViewModel;
	const { columnIdOrder } = pluginStates.colOrder;
	const { sortKeys } = pluginStates.sort;

	$: $columnIdOrder = statusColumns[status];
	$: $sortKeys = [{ id: sort, order: direction }];
</script>

<div class="position-table">
	<DataTable {hasPagination} {hasSearch} {tableViewModel} targetableRows size="sm" on:change />
</div>

<style>
	.position-table {
		/*
			Setting overflow:auto breaks the sticky header, but is required to prevent the layout
			from breaking on smaller viewports. Best compromise for now is to only set overflow
			on smaller viewports.
		 */
		@media (--viewport-sm-down) {
			overflow: auto;
		}
	}

	.position-table :global {
		/* Make "hidden" position rows look 50% opaque w/out breaking nested tooltip style */
		tr:has(.hidden) {
			td {
				background: var(--c-box-1);
			}

			/* only apply color-mix to text in leaf nodes */
			*:not(:has(*)) {
				color: color-mix(in srgb, currentColor, var(--c-body) 50%);
			}

			/* revert the color-mix 50% opacity for the tooltip */
			.tooltip .popup * {
				color: var(--c-text);
			}
		}

		.ticker {
			white-space: pre;
		}

		:is(.profit, .current_value, .value_at_open, .frozen_value, .opened_at, .closed_at, .frozen_at) {
			text-align: right;
		}
	}
</style>
