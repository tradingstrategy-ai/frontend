<script lang="ts">
	import type { TradeExecution } from 'trade-executor-frontend/state/interface';
	import { readable } from 'svelte/store';
	import { createTable, createRender } from 'svelte-headless-table';
	import { DataTable, Button, DateTime } from '$lib/components';
	import { formatDollar, formatTokenAmount } from 'trade-executor-frontend/helpers/formatters';

	export let trades: TradeExecution[];

	const table = createTable(readable(trades));

	const columns = table.createColumns([
		table.column({
			id: 'trade_id',
			header: 'Id',
			accessor: ({ trade_id, planned_quantity }) => {
				const label = planned_quantity > 0 ? 'Buy' : 'Sell';
				return `#${trade_id}: ${label}`;
			}
		}),
		table.column({
			header: 'Started',
			accessor: 'started_at',
			cell: ({ value }) => createRender(DateTime, { epoch: value, withSeconds: true })
		}),
		table.column({
			header: 'Executed',
			accessor: 'executed_at',
			cell: ({ value }) => createRender(DateTime, { epoch: value, withSeconds: true })
		}),
		table.column({
			id: 'value',
			header: 'Value',
			accessor: ({ executed_reserve, planned_reserve }) => formatDollar(parseFloat(executed_reserve || planned_reserve))
		}),
		table.column({
			id: 'quantity',
			header: 'Quantity',
			accessor: ({ executed_quantity, planned_quantity }) =>
				formatTokenAmount(parseFloat(executed_quantity || planned_quantity))
		}),
		table.column({
			header: '',
			id: 'button',
			accessor: ({ position_id, trade_id }) => ({ position_id, trade_id }),
			cell: ({ value }) =>
				createRender(Button, {
					tertiary: true,
					lg: true,
					label: 'Details',
					href: `./${value.position_id}/trade-${value.trade_id}`
				})
		})
	]);

	const tableViewModel = table.createViewModel(columns);
</script>

<section class="trade-table">
	<h2>Trades</h2>
	<DataTable {tableViewModel} />
</section>

<style lang="postcss">
	.trade-table {
		overflow: auto;

		& h2 {
			margin-bottom: var(--space-md);
		}
	}

	.trade-table :global {
		& .executed_at,
		& .value,
		& .quantity {
			text-align: right;
		}
	}
</style>
