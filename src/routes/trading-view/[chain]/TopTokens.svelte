<script lang="ts">
	import TradingEntitiesTable from './TradingEntitiesTable.svelte';
	import { formatDollar } from '$lib/helpers/formatters';

	export let loading = false;
	export let rows: Record<string, any>[] = [];

	const getHref = (row: Record<string, any>) => `/trading-view/${row.chain_slug}/tokens/${row.address}`;
</script>

<TradingEntitiesTable {loading} {rows} {getHref} let:row let:format>
	<td width="50%">{format(row.name)}</td>
	<td width="25%">{format(row.symbol)}</td>
	<td>{formatDollar(row.liquidity_latest)}</td>
</TradingEntitiesTable>
