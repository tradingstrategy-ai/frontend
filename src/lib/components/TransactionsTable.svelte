<script lang="ts">
	import DataTable from './DataTable.svelte';

	let classes = '';
	export { classes as class };

	const data = [
		{
			Chain: 'Polygon',
			'Transaction hash': '0x886b0204cae698f3e42237fc97ae6fade77776397339270551efbd18d3861f68',
			Status: 'Succeed'
		},
		{
			Chain: 'Binance Smart Chain',
			'Transaction hash': '0x886b0204cae698f3e42237fc97ae6fade77776397339270551efbd18d3861f68',
			Status: 'Succeed'
		}
	];
</script>

<section class="trades-table {classes}">
	<h2 class="ds-container">Blockchain transactions</h2>

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
