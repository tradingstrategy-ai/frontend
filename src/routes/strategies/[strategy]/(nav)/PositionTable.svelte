<script lang="ts">
	import type { Stats, TradingPosition } from 'trade-executor-frontend/state/interface';
	import { createCombinedPositionList } from 'trade-executor-frontend/state/stats';
	import { readable } from 'svelte/store';
	import { createTable, createRender } from 'svelte-headless-table';
	import { addSortBy, addTableFilter } from 'svelte-headless-table/plugins';
	import { formatDollar } from '$lib/helpers/formatters';
	import { DataTable, Button, DateTime } from '$lib/components';
	import Profitability from '../Profitability.svelte';

	export let hasSearch: boolean = false;
	export let hasPagination: boolean = false;
	export let positions: TradingPosition[];
	export let positionType: string;
	export let stats: Stats;

	const combinedPositions = createCombinedPositionList(positions, stats);
	const table = createTable(readable(combinedPositions), {
		tableFilter: addTableFilter(),
		sort: addSortBy()
	});

	const columns = table.createColumns([
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
			header: 'Value',
			id: 'value',
			accessor: ({ value }) => formatDollar(value)
		}),
		table.column({
			header: 'Opened',
			accessor: 'opened_at',
			cell: ({ value }) => createRender(DateTime, { epoch: value })
		}),
		table.column({
			header: '',
			id: 'button',
			accessor: 'position_id',
			cell: ({ value }) =>
				createRender(Button, {
					tertiary: true,
					lg: true,
					label: 'Details',
					href: `./${positionType}-positions/${value}`
				}),
			plugins: {
				sort: {
					disable: true
				}
			}
		})
	]);

	const tableViewModel = table.createViewModel(columns);

	const { pluginStates } = tableViewModel;

	const { filterValue } = pluginStates.tableFilter;
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
		& .opened_at {
			text-align: right;
		}
	}
</style>
