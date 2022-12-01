<script lang="ts">
	import DataTable from './DataTable.svelte';

	let classes = '';
	export { classes as class };

	const data = [
		{
			ID: '#1: Buy',
			Started: '2022-10-12 10:00',
			Executed: '2022-10-12 10:00',
			Value: '$0.69',
			Quantity: 'SOL 1.4',
			Details: '/strategies/quickswap-momentum/position-420/trade-1'
		},
		{
			ID: '#1: Buy',
			Started: '2022-10-12 10:00',
			Executed: '2022-10-12 10:00',
			Value: '$0.69',
			Quantity: 'SOL 1.4',
			Details: '/strategies/quickswap-momentum/position-420/trade-1'
		},
		{
			ID: '#1: Buy',
			Started: '2022-10-12 10:00',
			Executed: '2022-10-12 10:00',
			Value: '$0.69',
			Quantity: 'SOL 1.4',
			Details: '/strategies/quickswap-momentum/position-420/trade-1'
		},
		{
			ID: '#1: Buy',
			Started: '2022-10-12 10:00',
			Executed: '2022-10-12 10:00',
			Value: '$0.69',
			Quantity: 'SOL 1.4',
			Details: '/strategies/quickswap-momentum/position-420/trade-1'
		},
		{
			ID: '#1: Buy',
			Started: '2022-10-12 10:00',
			Executed: '2022-10-12 10:00',
			Value: '$0.69',
			Quantity: 'SOL 1.4',
			Details: '/strategies/quickswap-momentum/position-420/trade-1'
		},
		{
			ID: '#1: Buy',
			Started: '2022-10-12 10:00',
			Executed: '2022-10-12 10:00',
			Value: '$0.69',
			Quantity: 'SOL 1.4',
			Details: '/strategies/quickswap-momentum/position-420/trade-1'
		}
	];
</script>

<section class="trades-table {classes}">
	<h2 class="ds-container">Trades</h2>

	<DataTable {data} />
</section>

<style>
	h2 {
		margin: 0 0 1rem;
	}

	@media all and (min-width: 768px) {
		h2 {
			padding: 0;
		}
	}

	@media all and (max-width: 767px) {
		.trades-table {
			padding: 0;
		}
		.trades-table :global(table) {
			padding: 0 1.5rem;
			scroll-padding: 0 1.5rem;
		}
	}
</style>
