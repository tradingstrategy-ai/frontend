<script lang="ts">
	import TradingEntitiesTable from './TradingEntitiesTable.svelte';
	import LendingReserveLabel from '$lib/explorer/LendingReserveLabel.svelte';
	import { lendingReserveInternalUrl } from '$lib/helpers/lending-reserve';
	import { formatDollar } from '$lib/helpers/formatters';

	export let loading = false;
	export let rows: Record<string, any>[] = [];
</script>

<TradingEntitiesTable {loading} {rows} getHref={lendingReserveInternalUrl} let:row let:format>
	<td width="60%" class="asset">
		{#if row.asset_name}
			<LendingReserveLabel hideChainIcon reserve={row} />
		{:else}
			---
		{/if}
	</td>
	<td style:width="9ch">{format(row.protocol_name)}</td>
	<td style:width="9ch">{formatDollar(row.totalLiquidityUSD)}</td>
</TradingEntitiesTable>
