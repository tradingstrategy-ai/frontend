<script lang="ts">
	import { readable } from 'svelte/store';
	import { createRender, createTable } from 'svelte-headless-table';
	import { addSortBy, addPagination } from 'svelte-headless-table/plugins';
	import { DataTable } from '$lib/components';
	import { addClickableRows } from '$lib/components/datatable/plugins';
	import { formatDollar, formatAmount } from '$lib/helpers/formatters';
	import Button from '$lib/components/Button.svelte';

	export let exchanges: any[];

	function getExchangeUrl({ chain_slug, exchange_slug }: Record<string, string>) {
		return `/trading-view/${chain_slug}/${exchange_slug}`;
	}

	const table = createTable(readable(exchanges), {
		sort: addSortBy({
			initialSortKeys: [{ id: 'usd_volume_30d', order: 'desc' }],
			toggleOrder: ['asc', 'desc']
		}),
		page: addPagination(),
		clickable: addClickableRows({ href: getExchangeUrl })
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
		table.display({
			id: 'cta',
			header: '',
			cell: () => createRender(Button, { label: 'View exchange' })
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
