<script lang="ts">
	import type { TradingPosition } from 'trade-executor-frontend/state/interface';
	import { writable } from 'svelte/store';
	import { createTable, createRender } from 'svelte-headless-table';
	import { addSortBy, addTableFilter, addColumnOrder } from 'svelte-headless-table/plugins';
	import { formatDollar } from '$lib/helpers/formatters';
	import { DataTable, Button, DateTime } from '$lib/components';
	import Profitability from '../../Profitability.svelte';
	import FrozenOn from './FrozenOn.svelte';

	export let positions: TradingPosition[];
	export let status: string;
	export let columns: string[];
	export let hasSearch = false;
	export let hasPagination = false;

	const positionsStore = writable([] as TradingPosition[]);

	$: positionsStore.set(positions);

	const table = createTable(positionsStore, {
		colOrder: addColumnOrder({ hideUnspecifiedColumns: true }),
		tableFilter: addTableFilter(),
		sort: addSortBy({
			initialSortKeys: [{ id: 'position_id', order: 'asc' }],
			toggleOrder: ['asc', 'desc']
		})
	});

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
			cell: ({ value }) => createRender(Profitability, { value })
		}),
		table.column({
			header: 'Frozen on',
			id: 'frozen_on',
			accessor: ({ trades }) => {
				const lastTrade = Object.values(trades).at(-1);
				const quantity = lastTrade.planned_quantity;
				if (!quantity) return '---';
				return quantity > 0 ? 'buy' : 'sell';
			},
			cell: ({ value }) => createRender(FrozenOn, { value })
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
			accessor: ({ trades }) => Object.values(trades).at(-1)?.planned_reserve,
			cell: ({ value }) => formatDollar(value)
		}),
		table.column({
			header: 'Opened',
			accessor: 'opened_at',
			cell: ({ value }) => createRender(DateTime, { epoch: value })
		}),
		table.column({
			header: 'Closed',
			accessor: 'closed_at',
			cell: ({ value }) => createRender(DateTime, { epoch: value })
		}),
		table.column({
			header: 'Frozen at',
			accessor: 'frozen_at',
			cell: ({ value }) => createRender(DateTime, { epoch: value })
		}),
		table.column({
			header: '',
			id: 'details_cta',
			accessor: 'position_id',
			cell: ({ value }) =>
				createRender(Button, {
					tertiary: true,
					lg: true,
					label: 'Details',
					href: `./${status}-positions/${value}`
				}),
			plugins: { sort: { disable: true } }
		})
	]);

	const tableViewModel = table.createViewModel(tableColumns);
	const { pluginStates } = tableViewModel;
	const { columnIdOrder } = pluginStates.colOrder;
	const { filterValue } = pluginStates.tableFilter;

	$: $columnIdOrder = ['position_id', 'ticker'].concat(columns);
</script>

<div class="position-table">
	<DataTable {hasPagination} {hasSearch} {tableViewModel} bind:searchInputValue={$filterValue} />
</div>

<style lang="postcss">
	.position-table :global {
		display: contents;

		& .ticker {
			white-space: pre;
		}

		& .profitability,
		& .value,
		& .value_at_open,
		& .frozen_value,
		& .opened_at,
		& .closed_at,
		& .frozen_at {
			text-align: right;
		}
	}
</style>
