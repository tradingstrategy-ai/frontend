<script lang="ts">
	import { readable } from 'svelte/store';
	import { createRender, createTable } from 'svelte-headless-table';
	import { addSortBy, addPagination } from 'svelte-headless-table/plugins';
	import { DataTable } from '$lib/components';
	import { formatDollar, formatAmount } from '$lib/helpers/formatters';
	import Button from '$lib/components/Button.svelte';

	export let exchanges: any[];

	const table = createTable(readable(exchanges), {
		sort: addSortBy({
			initialSortKeys: [{ id: 'usd_volume_30d', order: 'desc' }],
			toggleOrder: ['asc', 'desc']
		}),
		page: addPagination()
	});

	const columns = table.createColumns([
		table.column({
			header: 'Exchange',
			accessor: 'human_readable_name'
		}),
		table.column({
			header: 'Blockchain',
			accessor: 'chain_name'
		}),
		table.column({
			header: 'Trading pairs',
			accessor: 'pair_count',
			cell: ({ value }) => formatAmount(value)
		}),
		table.column({
			header: 'Volume 30d (USD)',
			accessor: 'usd_volume_30d',
			cell: ({ value }) => formatDollar(value)
		}),
		table.column({
			id: 'cta',
			header: '',
			accessor: ({ chain_slug, exchange_slug }) => ({ chain_slug, exchange_slug }),
			cell: ({ value }) =>
				createRender(Button, {
					label: 'View exchange',
					href: `/trading-view/${value.chain_slug}/${value.exchange_slug}`
				}),
			plugins: { sort: { disable: true } }
		})
	]);

	const tableViewModel = table.createViewModel(columns);
</script>

<div class="exchange-table">
	<DataTable isResponsive hasPagination={true} {tableViewModel} />
</div>

<style lang="postcss">
	.exchange-table :global {
		@media (--viewport-md-up) {
			& :is(.pair_count, .usd_volume_30d) {
				text-align: right;
			}
		}
	}
</style>
