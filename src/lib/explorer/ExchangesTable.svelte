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
			accessor: ({ human_readable_name }) => human_readable_name
		}),
		table.column({
			id: 'blockchain',
			header: 'Blockchain',
			accessor: ({ chain_name }) => chain_name
		}),
		table.column({
			id: 'trading_pairs',
			header: 'Trading pairs',
			accessor: ({ pair_count }) => pair_count
		}),
		table.column({
			id: 'volume_30d',
			header: 'Volume 30d (USD)',
			accessor: ({ usd_volume_30d }) => usd_volume_30d
		}),
		table.column({
			id: 'cta',
			header: '',
			accessor: ({ chain_slug, exchange_slug }) => ({ chain_slug, exchange_slug }),
			cell: ({ value }) =>
				createRender(Button, {
					label: 'View exchange',
					href: `/trading-view/${value.chain_slug}/${value.exchange_slug}`
				})
		})
	]);

	const tableViewModel = table.createViewModel(columns);
</script>

<DataTable isResponsive {tableViewModel} />
