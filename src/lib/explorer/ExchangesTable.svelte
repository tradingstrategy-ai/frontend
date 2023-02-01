<script lang="ts">
	import { readable } from 'svelte/store';
	import { createRender, createTable } from 'svelte-headless-table';
	import { DataTable } from '$lib/components';
	import Button from '$lib/components/Button.svelte';

	export let exchanges: any[];

	$: console.log(exchanges);

	const table = createTable(readable(exchanges));

	const columns = table.createColumns([
		table.column({
			id: 'exchange',
			header: 'Exchange',
			accessor: ({ exchange }) => exchange
		}),
		table.column({
			id: 'blockchain',
			header: 'Blockchain',
			accessor: ({ blockchain }) => blockchain
		}),
		table.column({
			id: 'trading_pairs',
			header: 'Trading pairs',
			accessor: ({ trading_pairs }) => trading_pairs
		}),
		table.column({
			id: 'volume_30d',
			header: 'Volume 30d (USD)',
			accessor: ({ volume_30d }) => volume_30d
		}),
		table.column({
			id: 'cta',
			header: '',
			accessor: ({ exchange_slug }) => exchange_slug,
			cell: ({ value }) => createRender(Button, { label: 'View exchange', href: value.exchange_slug })
		})
	]);

	const tableViewModel = table.createViewModel(columns);
</script>

<section class="exchanges-table">
	<DataTable {tableViewModel} />
</section>
