<script lang="ts">
	import TradingEntitiesTable from './TradingEntitiesTable.svelte';
	import { formatDollar } from '$lib/helpers/formatters';

	export let loading = false;
	export let rows: Record<string, any>[] = [];

	const getHref = (row: Record<string, any>) => `/trading-view/${row.chain_slug}/tokens/${row.address}`;
</script>

<TradingEntitiesTable {loading} {rows} {getHref} let:row let:format>
	<td width="75%">
		{format(row.name)}
		<span class="symbol">{format(row.symbol)}</span>
	</td>
	<td>{formatDollar(row.liquidity_latest)}</td>
</TradingEntitiesTable>

<style>
	.symbol {
		margin-left: 0.25em;
		color: var(--c-text-extra-light);
	}
</style>
