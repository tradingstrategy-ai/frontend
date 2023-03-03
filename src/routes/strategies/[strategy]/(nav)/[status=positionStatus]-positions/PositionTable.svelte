<script lang="ts">
	import type { TradingPosition } from 'trade-executor-frontend/state/interface';
	import { writable } from 'svelte/store';
	import { createTable, createRender } from 'svelte-headless-table';
	import { addSortBy, addTableFilter, addColumnOrder, addPagination } from 'svelte-headless-table/plugins';
	import { addClickableRows } from '$lib/components/datatable/plugins';
	import { formatProfitability } from 'trade-executor-frontend/helpers/formatters';
	import { determineProfitability } from 'trade-executor-frontend/helpers/profit';
	import { formatDollar } from '$lib/helpers/formatters';
	import { fromUnixTime } from 'date-fns';
	import { DataTable, Button, Timestamp, UpDownCell } from '$lib/components';
	import FrozenStatus from './FrozenStatus.svelte';

	export let positions: TradingPosition[];
	export let status: string;
	export let columns: string[];
	export let page = 0;
	export let sort = 'position_id';
	export let filter = '';
	export let direction: 'asc' | 'desc' = 'desc';
	export let hasSearch = false;
	export let hasPagination = false;

	const positionsStore = writable([] as TradingPosition[]);

	$: positionsStore.set(positions);

	function toISODate(epoch: number) {
		return epoch && fromUnixTime(epoch).toISOString();
	}

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

	function getLastTrade({ trades }) {
		return Object.values(trades).at(-1);
	}

	const tableColumns = table.createColumns([
		table.column({
			header: 'Id',
			accessor: 'position_id'
		}),
		table.column({
			header: 'Ticker',
			accessor: 'ticker'
		}),
		table.column({
			header: 'Profitability',
			accessor: 'profitability',
			cell: ({ value }) =>
				createRender(UpDownCell, { value, formatter: formatProfitability, compareFn: determineProfitability })
		}),
		table.column({
			header: 'Frozen on',
			id: 'frozen_status',
			accessor: (position) => getLastTrade(position)?.planned_quantity,
			cell: ({ value }) => createRender(FrozenStatus, { lastTradeQuantity: value })
		}),
		table.column({
			header: 'Value',
			accessor: 'value',
			cell: ({ value }) => formatDollar(value)
		}),
		table.column({
			header: 'Value (Open)',
			accessor: 'value_at_open',
			cell: ({ value }) => formatDollar(value)
		}),
		table.column({
			header: 'Value',
			id: 'frozen_value',
			accessor: (position) => getLastTrade(position)?.planned_reserve,
			cell: ({ value }) => formatDollar(value)
		}),
		table.column({
			header: 'Opened',
			id: 'opened_at',
			accessor: ({ opened_at }) => toISODate(opened_at),
			cell: ({ value }) => createRender(Timestamp, { date: value, format: 'iso', withTime: true })
		}),
		table.column({
			header: 'Closed',
			id: 'closed_at',
			accessor: ({ closed_at }) => toISODate(closed_at),
			cell: ({ value }) => createRender(Timestamp, { date: value, format: 'iso', withTime: true })
		}),
		table.column({
			header: 'Frozen at',
			id: 'frozen_at',
			accessor: ({ frozen_at }) => toISODate(frozen_at),
			cell: ({ value }) => createRender(Timestamp, { date: value, format: 'iso', withTime: true })
		}),
		table.column({
			header: '',
			id: 'cta',
			accessor: ({ position_id }) => `./${status}-positions/${position_id}`,
			cell: ({ value }) => createRender(Button, { label: 'Details', href: value }),
			plugins: { sort: { disable: true } }
		})
	]);

	const tableViewModel = table.createViewModel(tableColumns);
	const { pluginStates } = tableViewModel;
	const { columnIdOrder } = pluginStates.colOrder;

	$: $columnIdOrder = ['position_id', 'ticker'].concat(columns);
</script>

<div class="position-table">
	<DataTable {hasPagination} {hasSearch} {tableViewModel} on:change />
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
		& .ticker {
			white-space: pre;
		}

		& :is(.profitability, .value, .value_at_open, .frozen_value, .opened_at, .closed_at, .frozen_at) {
			text-align: right;
		}

		@media (--viewport-sm-down) {
			--up-down-font: var(--f-ui-xs-medium);
			--up-down-spacing: var(--f-ui-xs-spacing);
		}
	}
</style>
