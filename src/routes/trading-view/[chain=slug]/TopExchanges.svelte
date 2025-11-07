<script lang="ts">
	import TradingEntitiesTable, { type EntityTableProps } from './TradingEntitiesTable.svelte';
	import { formatDollar } from '$lib/helpers/formatters';

	let props: EntityTableProps = $props();

	const getHref = (row: Record<string, any>) => `/trading-view/${row.chain_slug}/${row.exchange_slug}`;
</script>

<TradingEntitiesTable {...props} {getHref}>
	{#snippet cells(row, format)}
		<td>{format(row.human_readable_name)}</td>
		<td>{formatDollar(row.usd_volume_30d)}</td>
	{/snippet}
</TradingEntitiesTable>
