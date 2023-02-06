<script lang="ts">
	import { readable } from 'svelte/store';
	import { createRender, createTable } from 'svelte-headless-table';
	import { addSortBy, addTableFilter, addColumnOrder, addPagination } from 'svelte-headless-table/plugins';
	import { DataTable } from '$lib/components';
	import { formatDollar, formatAmount, formatPriceChange } from '$lib/helpers/formatters';
	import Button from '$lib/components/Button.svelte';

	export let exchanges: any[];

	const table = createTable(readable(exchanges), {
		sort: addSortBy({
			initialSortKeys: [{ id: 'trading_pairs right', order: 'desc' }],
			toggleOrder: ['asc', 'desc']
		}),
		page: addPagination()
	});

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
			id: 'trading_pairs right',
			header: 'Trading pairs',
			accessor: ({ pair_count }) => pair_count
		}),
		table.column({
			id: 'volume_30d right',
			header: 'Volume 30d (USD)',
			accessor: ({ usd_volume_30d }) => formatDollar(usd_volume_30d)
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
