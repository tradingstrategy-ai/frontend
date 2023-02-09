<script lang="ts">
	import { readable } from 'svelte/store';
	import { createRender, createTable } from 'svelte-headless-table';
	import { addSortBy, addPagination } from 'svelte-headless-table/plugins';
	import { addClickableRows } from '$lib/components/datatable/plugins';
	import { formatDollar, formatPriceChange, formatSwapFee } from '$lib/helpers/formatters';
	import { Button, DataTable } from '$lib/components';

	export let pairs: any[];

	const table = createTable(readable(pairs), {
		sort: addSortBy({
			initialSortKeys: [{ id: 'usd_volume_30d', order: 'desc' }],
			toggleOrder: ['asc', 'desc']
		}),
		page: addPagination(),
		clickable: addClickableRows({
			href: (row: any) => `/trading-view/${row.chain_slug}/${row.exchange_slug}/${row.pair_slug}`
		})
	});

	const columns = table.createColumns([
		table.column({
			header: 'Trading pair',
			accessor: 'pair_symbol'
		}),
		table.column({
			header: 'Exchange',
			accessor: 'exchange_name'
		}),
		table.column({
			header: 'Fee',
			accessor: 'pair_swap_fee',
			cell: ({ value }) => formatSwapFee(value)
		}),
		table.column({
			header: 'Price USD',
			accessor: 'usd_price_latest',
			cell: ({ value }) => formatDollar(value)
		}),
		table.column({
			header: 'Price Δ 24h',
			accessor: 'price_change_24h',
			cell: ({ value }) => formatPriceChange(value)
		}),
		table.column({
			header: 'Vol 30d USD',
			accessor: 'usd_volume_30d',
			cell: ({ value }) => formatDollar(value)
		}),
		table.column({
			header: 'Liq USD',
			accessor: 'usd_liquidity_latest',
			cell: ({ value }) => formatDollar(value)
		}),
		table.column({
			header: 'Liq Δ 24h',
			accessor: 'liquidity_change_24h',
			cell: ({ value }) => formatPriceChange(value)
		}),
		table.display({
			id: 'cta',
			header: '',
			cell: () => createRender(Button, { label: 'View pair' }),
			plugins: { sort: { disable: true } }
		})
	]);

	const tableViewModel = table.createViewModel(columns);
</script>

<div class="pairs-table">
	<DataTable isResponsive hasPagination {tableViewModel} />
</div>

<style lang="postcss">
	.pairs-table :global {
		@media (--viewport-md-up) {
			&
				:is(.pair_swap_fee, .usd_price_latest, .price_change_24h, .usd_volume_30d, .usd_liquidity_latest, .liquidity_change_24h) {
				text-align: right;
				&:is(td) {
					overflow: hidden;
					text-overflow: ellipsis;
				}
			}

			& tr:hover td {
				position: relative;
				overflow: visible;
			}

			& .pair_swap_fee {
				max-width: 6rem;
			}
			& .usd_price_latest {
				max-width: 8.5rem;
			}
			& .price_change_24h {
				max-width: 9rem;
			}
			& .usd_volume_30d {
				max-width: 9rem;
			}
			& .usd_liquidity_latest {
				max-width: 7rem;
			}
			& .liquidity_change_24h {
				max-width: 8rem;
			}
		}
	}
</style>
