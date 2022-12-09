<script lang="ts">
	import type { Stats, TradingPosition } from 'trade-executor-frontend/state/interface';
	import { createCombinedPositionList } from 'trade-executor-frontend/state/stats';
	import { readable } from 'svelte/store';
	import { createTable, createRender } from 'svelte-headless-table';
	import { formatUnixTimestampAsHours } from 'trade-executor-frontend/helpers/formatters';
	import { formatDollar } from '$lib/helpers/formatters';
	import { DataTable } from '$lib/components';
	import { Button } from '$lib/components';
	import Profitability from '../Profitability.svelte';

	export let positions: TradingPosition[];
	export let stats: Stats;

	const combinedPositions = createCombinedPositionList(positions, stats);
	const table = createTable(readable(combinedPositions));

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
			id: 'opened',
			accessor: ({ opened_at }) => formatUnixTimestampAsHours(opened_at)
		}),
		table.column({
			header: '',
			id: 'button',
			accessor: 'position_id',
			cell: ({ value }) =>
				createRender(Button, {
					tertiary: true,
					label: 'Details',
					href: `./open-positions/${value}`
				})
		})
	]);

	const tableViewModel = table.createViewModel(columns);
</script>

<div class="position-table-wrapper">
	<DataTable {tableViewModel} />
</div>

<style lang="postcss">
	.position-table-wrapper :global {
		display: contents;

		& .profitability,
		& .value,
		& .opened {
			text-align: right;
		}
	}
</style>
