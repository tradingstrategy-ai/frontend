<script lang="ts">
	import type { PositionStatus } from 'trade-executor/state/position';
	import type { TradingPositionInfo } from 'trade-executor/state/position-info';
	import { writable } from 'svelte/store';
	import { createTable, createRender } from 'svelte-headless-table';
	import { addSortBy, addTableFilter, addColumnOrder, addPagination } from 'svelte-headless-table/plugins';
	import { addClickableRows } from '$lib/components/datatable/plugins';
	import { formatProfitability } from 'trade-executor/helpers/formatters';
	import { determineProfitability } from 'trade-executor/helpers/profit';
	import { formatDollar } from '$lib/helpers/formatters';
	import { DataTable, Button, Timestamp, UpDownCell } from '$lib/components';
	import TradingDescription from '$lib/explorer/TradingDescription.svelte';
	import FlagCell from './FlagCell.svelte';

	export let admin = false;
	export let positions: TradingPositionInfo[];
	export let status: PositionStatus;
	export let page = 0;
	export let sort = 'position_id';
	export let filter = '';
	export let direction: 'asc' | 'desc' = 'desc';
	export let hasSearch = false;
	export let hasPagination = false;
	export let hiddenPositions: number[] = [];

	const positionsStore = writable([] as TradingPositionInfo[]);
	$: positionsStore.set(positions);

	const statusColumns = {
		open: ['description', 'flags', 'profitability', 'current_value', 'opened_at', 'cta'],
		closed: ['description', 'flags', 'profitability', 'value_at_open', 'closed_at', 'cta'],
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
			toggleOrder: ['asc', 'desc']
		}),
		page: addPagination({ initialPageIndex: page }),
		clickable: addClickableRows({ id: 'cta' })
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
				isTest
			}),
			cell: ({ value }) => createRender(TradingDescription, value)
		}),
		table.column({
			header: 'Remarks',
			id: 'flags',
			accessor: (position) => position,
			cell: ({ value }) =>
				createRender(FlagCell, {
					admin,
					position: value,
					baseUrl: `./${status}-positions/${value.position_id}`,
					isHidden: hiddenPositions.includes(value.position_id)
				}),
			plugins: { sort: { disable: true } }
		}),
		table.column({
			header: 'Profitability',
			accessor: 'profitability',
			cell: ({ value }) =>
				createRender(UpDownCell, { value, formatter: formatProfitability, compareFn: determineProfitability })
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
			cell: ({ value }) => createRender(Button, { label: 'Details', href: value, size: 'xs' }),
			plugins: { sort: { disable: true } }
		})
	]);

	const tableViewModel = table.createViewModel(tableColumns);
	const { pluginStates } = tableViewModel;
	const { columnIdOrder } = pluginStates.colOrder;

	$: $columnIdOrder = statusColumns[status];
</script>

<div class="position-table">
	<DataTable {hasPagination} {hasSearch} {tableViewModel} on:change size="sm" />
</div>

<style lang="postcss">
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
			*:not(:has(> *)) {
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

		.profitability {
			padding-block: 0;
		}

		:is(.profitability, .current_value, .value_at_open, .frozen_value, .opened_at, .closed_at, .frozen_at) {
			text-align: right;
		}

		@media (--viewport-sm-down) {
			--up-down-font: var(--f-ui-xs-medium);
			--up-down-spacing: var(--f-ui-xs-spacing);
		}
	}
</style>
