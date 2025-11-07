<script lang="ts">
	import TradingEntitiesTable, { type EntityTableProps } from './TradingEntitiesTable.svelte';
	import { formatDollar } from '$lib/helpers/formatters';

	let props: EntityTableProps = $props();

	const getHref = (row: Record<string, any>) => `/trading-view/${row.chain_slug}/tokens/${row.address}`;
</script>

<TradingEntitiesTable {...props} {getHref}>
	{#snippet cells(row, format)}
		<td width="75%">
			{format(row.name)}
			<span class="symbol">{format(row.symbol)}</span>
		</td>
		<td>{formatDollar(row.liquidity_latest)}</td>
	{/snippet}
</TradingEntitiesTable>

<style>
	.symbol {
		margin-left: 0.25em;
		color: var(--c-text-extra-light);
	}
</style>
