<script lang="ts">
	import TradingEntitiesTable from './TradingEntitiesTable.svelte';
	import { formatInterestRate } from '$lib/helpers/formatters';

	export let loading = false;
	export let rows: Record<string, any>[] = [];

	const getHref = (row: Record<string, any>) =>
		`/trading-view/${row.chain_slug}/lending/${row.protocol_slug}/${row.reserve_slug}`;
</script>

<TradingEntitiesTable {loading} {rows} {getHref} let:row let:format>
	<td width="50%">{format(row.asset_name)}</td>
	<td width="25%">{format(row.asset_symbol)}</td>
	<td>{formatInterestRate(row.additional_details?.variable_borrow_apr_latest)}</td>
</TradingEntitiesTable>
