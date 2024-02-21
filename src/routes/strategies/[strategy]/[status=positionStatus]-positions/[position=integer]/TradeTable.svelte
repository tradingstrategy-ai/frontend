<script lang="ts">
	import type { TradeInfo } from 'trade-executor/state/trade-info';
	import { readable } from 'svelte/store';
	import { createTable, createRender } from 'svelte-headless-table';
	import { addClickableRows } from '$lib/components/datatable/plugins';
	import { DataTable, Button, Timestamp } from '$lib/components';
	import { formatPrice } from '$lib/helpers/formatters';
	import TradingDescription from '$lib/explorer/TradingDescription.svelte';

	export let trades: TradeInfo[];

	const table = createTable(readable(trades), {
		clickable: addClickableRows({ id: 'cta' })
	});

	const columns = table.createColumns([
		table.column({
			id: 'trade_id',
			header: '',
			accessor: ({ trade_id }) => `#${trade_id}`
		}),
		table.column({
			id: 'description',
			header: 'Trade',
			accessor: (t) => ({ label: t.actionLabel, modifier: t.positionImpact, isTest: t.isTest }),
			cell: ({ value }) => createRender(TradingDescription, value)
		}),
		table.column({
			header: 'Executed',
			accessor: 'executed_at',
			cell: ({ value }) => createRender(Timestamp, { date: value, withSeconds: true })
		}),
		table.column({
			id: 'price',
			header: 'Price',
			accessor: ({ executed_price, planned_price }) => formatPrice(executed_price ?? planned_price, 5)
		}),
		table.column({
			id: 'value',
			header: 'Value',
			accessor: ({ executed_reserve, planned_reserve }) => formatPrice(executed_reserve ?? planned_reserve, 5)
		}),
		table.column({
			header: '',
			id: 'cta',
			accessor: ({ position_id, trade_id }) => `./${position_id}/trade-${trade_id}`,
			cell: ({ value }) => createRender(Button, { label: 'Details', href: value, size: 'xs' })
		})
	]);

	const tableViewModel = table.createViewModel(columns);
</script>

<section class="trade-table">
	<h2>Trades</h2>
	<DataTable {tableViewModel} size="sm" />
</section>

<style lang="postcss">
	.trade-table {
		overflow-x: auto;
		overflow-y: hidden;

		h2 {
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
		.trade_id {
			color: var(--c-text-extra-light);
			width: 2em;
			padding-right: 0;
		}

		:is(.price, .value) {
			text-align: right;
		}
	}
</style>
