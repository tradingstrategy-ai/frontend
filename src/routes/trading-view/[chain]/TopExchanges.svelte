<script lang="ts">
	import TradingEntitiesTable from './TradingEntitiesTable.svelte';
	import { formatDollar } from '$lib/helpers/formatters';

	export let loading = false;
	export let rows: Record<string, any>[];

	const getHref = (row: Record<string, any>) => `/trading-view/${row.chain_slug}/${row.exchange_slug}`;
</script>

<TradingEntitiesTable {loading} {rows} {getHref} let:row>
	<td width="75%">
		{row.human_readable_name ?? '---'}
	</td>
	<td width="25%">
		{formatDollar(row.usd_volume_30d)}
	</td>
</TradingEntitiesTable>
