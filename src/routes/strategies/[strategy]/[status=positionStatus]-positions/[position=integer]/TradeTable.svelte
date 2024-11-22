<script lang="ts">
	import type { TradeInfo } from 'trade-executor/models/trade-info';
	import { readable } from 'svelte/store';
	import { createTable, createRender } from 'svelte-headless-table';
	import { addHiddenColumns } from 'svelte-headless-table/plugins';
	import Timestamp from '$lib/components/Timestamp.svelte';
	import DataTable from '$lib/components/datatable/DataTable.svelte';
	import TableRowTarget from '$lib/components/datatable/TableRowTarget.svelte';
	import { formatPrice, formatPercent } from '$lib/helpers/formatters';
	import TradingDescription from 'trade-executor/components/TradingDescription.svelte';

	export let trades: TradeInfo[];
	export let isCreditPosition;
	export let interestRateAtOpen: MaybeNumber;

	const hiddenColumns = isCreditPosition ? ['price'] : ['interest_rate'];

	const table = createTable(readable(trades), {
		hide: addHiddenColumns({ initialHiddenColumnIds: hiddenColumns })
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
			accessor: (t) => ({
				label: t.actionLabel,
				modifier: t.positionImpact,
				isTest: t.isTest,
				failed: t.failed,
				stopLoss: t.isStopLoss
			}),
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
			accessor: ({ executed_price, planned_price }) => formatPrice(executed_price ?? planned_price, 2, 5)
		}),
		table.column({
			id: 'interest_rate',
			header: 'Interest rate',
			accessor: (trade) => (trade === trades[0] ? formatPercent(interestRateAtOpen) : '')
		}),
		table.column({
			id: 'value',
			header: 'Value',
			accessor: ({ value }) => formatPrice(value, 2, 5)
		}),
		table.column({
			header: '',
			id: 'cta',
			accessor: ({ position_id, trade_id }) => `./${position_id}/trade-${trade_id}`,
			cell: ({ value }) => createRender(TableRowTarget, { href: value, size: 'xs' })
		})
	]);

	const tableViewModel = table.createViewModel(columns);
</script>

<section class="trade-table">
	<h2>Trades</h2>
	<DataTable {tableViewModel} targetableRows size="sm" />
</section>

<style>
	.trade-table {
		overflow-x: auto;
		overflow-y: hidden;

		h2 {
			margin-bottom: var(--space-md);
			font: var(--f-heading-lg-medium);

			@media (--viewport-sm-down) {
				font: var(--f-heading-md-medium);
			}
		}
	}

	.trade-table :global {
		.trade_id {
			color: var(--c-text-extra-light);
			width: 2em;
			padding-right: 0;
		}

		:is(.price, .interest_rate, .value) {
			text-align: right;
		}
	}
</style>
