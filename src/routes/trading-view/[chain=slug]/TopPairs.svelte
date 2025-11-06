<script lang="ts">
	import TradingEntitiesTable, { type EntityTableProps } from './TradingEntitiesTable.svelte';
	import { formatDollar } from '$lib/helpers/formatters';

	let props: EntityTableProps = $props();

	const getHref = (row: Record<string, any>) => `/trading-view/${row.chain_slug}/${row.exchange_slug}/${row.pair_slug}`;
</script>

<TradingEntitiesTable {...props} {getHref}>
	{#snippet cells(row, format)}
		<td width="40%">{format(row.pair_symbol)}</td>
		<td width="35%">{format(row.exchange_name)}</td>
		<td>{formatDollar(row.pair_tvl)}</td>
	{/snippet}
</TradingEntitiesTable>
