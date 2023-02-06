<script lang="ts">
	import { readable } from 'svelte/store';
	import { createRender, createTable } from 'svelte-headless-table';
	import { addSortBy, addTableFilter, addColumnOrder, addPagination } from 'svelte-headless-table/plugins';
	import { DataTable } from '$lib/components';
	import { formatDollar, formatAmount, formatPriceChange } from '$lib/helpers/formatters';
	import Button from '$lib/components/Button.svelte';

	export let pairs: any[];

	console.log(pairs);

	const table = createTable(readable(pairs), {
		sort: addSortBy({
			initialSortKeys: [{ id: 'usd_volume_30d right', order: 'desc' }],
			toggleOrder: ['asc', 'desc']
		}),
		page: addPagination()
	});

	const columns = table.createColumns([
		table.column({
			id: 'pair_symbol',
			header: 'Trading pair',
			accessor: ({ pair_symbol }) => pair_symbol
		}),
		table.column({
			id: 'exchange_name',
			header: 'Exchange',
			accessor: ({ exchange_name }) => exchange_name
		}),
		table.column({
			id: 'pair_swap_fee right',
			header: 'Swap fee',
			accessor: ({ pair_swap_fee }) => pair_swap_fee
		}),
		table.column({
			id: 'usd_price_latest right',
			header: 'Price (USD)',
			accessor: ({ usd_price_latest }) => formatDollar(usd_price_latest)
		}),
		table.column({
			id: 'price_change_24h right',
			header: 'Price 24h',
			accessor: ({ price_change_24h }) => formatPriceChange(price_change_24h)
		}),
		table.column({
			id: 'usd_volume_30d right',
			header: 'Vol 30d (USD)',
			accessor: ({ usd_volume_30d }) => formatDollar(usd_volume_30d)
		}),
		table.column({
			id: 'usd_liquidity_latest right',
			header: 'Liq (USD)',
			accessor: ({ usd_liquidity_latest }) => formatDollar(usd_liquidity_latest)
		}),
		table.column({
			id: 'liquidity_change_24h right',
			header: 'Liq 24h',
			accessor: ({ liquidity_change_24h }) => formatPriceChange(liquidity_change_24h)
		}),
		table.column({
			id: 'cta',
			header: '',
			accessor: ({ chain_slug, exchange_slug, pair_slug }) => ({ chain_slug, exchange_slug, pair_slug }),
			cell: ({ value }) =>
				createRender(Button, {
					label: 'View pair',
					href: `/trading-view/${value.chain_slug}/${value.exchange_slug}/${value.pair_slug}`
				})
		})
	]);

	const tableViewModel = table.createViewModel(columns);
</script>

<DataTable isResponsive {tableViewModel} />
