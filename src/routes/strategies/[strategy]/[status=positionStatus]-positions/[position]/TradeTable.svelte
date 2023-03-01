<script lang="ts">
	import type { TradeExecution } from 'trade-executor-frontend/state/interface';
	import { readable } from 'svelte/store';
	import { createTable, createRender } from 'svelte-headless-table';
	import { addClickableRows } from '$lib/components/datatable/plugins';
	import { DataTable, Button, Timestamp } from '$lib/components';
	import { formatDollar, formatTokenAmount } from 'trade-executor-frontend/helpers/formatters';

	export let trades: TradeExecution[];

	const table = createTable(readable(trades), {
		clickable: addClickableRows({ id: 'cta' })
	});

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
			cell: ({ value }) => createRender(Timestamp, { date: value, format: 'iso', withSeconds: true })
		}),
		table.column({
			header: 'Executed',
			accessor: 'executed_at',
			cell: ({ value }) => createRender(Timestamp, { date: value, format: 'iso', withSeconds: true })
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
			id: 'cta',
			accessor: ({ position_id, trade_id }) => `./${position_id}/trade-${trade_id}`,
			cell: ({ value }) => createRender(Button, { label: 'Details', href: value })
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
		overflow-x: auto;
		overflow-y: hidden;

		& h2 {
			margin-bottom: var(--space-md);
			font: var(--f-heading-xl-medium);
			letter-spacing: var(--f-heading-xl-spacing, normal);

			@media (--viewport-sm-down) {
				font: var(--f-heading-md-medium);
				letter-spacing: var(--f-heading-md-spacing, normal);
			}
		}
	}

	.trade-table :global {
		& :is(.executed_at, .value, .quantity) {
			text-align: right;
		}
	}
</style>
