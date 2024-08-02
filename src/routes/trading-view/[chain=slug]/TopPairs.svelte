<script lang="ts">
	import TradingEntitiesTable from './TradingEntitiesTable.svelte';
	import { formatDollar } from '$lib/helpers/formatters';

	export let loading = false;
	export let rows: Record<string, any>[] = [];

	const getHref = (row: Record<string, any>) => `/trading-view/${row.chain_slug}/${row.exchange_slug}/${row.pair_slug}`;
</script>

<TradingEntitiesTable {loading} {rows} {getHref} let:row let:format>
	<td width="40%">{format(row.pair_symbol)}</td>
	<td width="35%">{format(row.exchange_name)}</td>
	<td>{formatDollar(row.pair_tvl)}</td>
</TradingEntitiesTable>
