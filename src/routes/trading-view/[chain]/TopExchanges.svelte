<script lang="ts">
	import TradingEntitiesTable from './TradingEntitiesTable.svelte';
	import { formatDollar } from '$lib/helpers/formatters';

	export let loading = false;
	export let rows: Record<string, any>[];

	const getHref = (row: Record<string, any>) => `/trading-view/${row.chain_slug}/${row.exchange_slug}`;
</script>

<TradingEntitiesTable {loading} {rows} {getHref} let:row let:format>
	<td>{format(row.human_readable_name)}</td>
	<td>{formatDollar(row.usd_volume_30d)}</td>
</TradingEntitiesTable>
