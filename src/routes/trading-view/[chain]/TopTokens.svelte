<script lang="ts">
	import TradingEntitiesTable from './TradingEntitiesTable.svelte';
	import { formatDollar } from '$lib/helpers/formatters';

	export let loading = false;
	export let rows: Record<string, any>[] = [];

	const getHref = (row: Record<string, any>) => `/trading-view/${row.chain_slug}/tokens/${row.address}`;
</script>

<TradingEntitiesTable {loading} {rows} {getHref} let:row>
	<td width="45%">
		{row.name ?? '---'}
	</td>
	<td width="30%">
		{row.symbol ?? '---'}
	</td>
	<td width="25%">
		{formatDollar(row.liquidity_latest)}
	</td>
</TradingEntitiesTable>
