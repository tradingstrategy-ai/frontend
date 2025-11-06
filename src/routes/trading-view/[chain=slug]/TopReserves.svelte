<script lang="ts">
	import type { LendingReserve } from '$lib/explorer/lending-reserve-client';
	import TradingEntitiesTable, { type EntityTableProps } from './TradingEntitiesTable.svelte';
	import LendingReserveLabel from '$lib/explorer/LendingReserveLabel.svelte';
	import { lendingReserveInternalUrl } from '$lib/helpers/lending-reserve';
	import { formatDollar } from '$lib/helpers/formatters';

	let props: EntityTableProps = $props();
</script>

<TradingEntitiesTable {...props} getHref={lendingReserveInternalUrl}>
	{#snippet cells(row, format)}
		<td width="60%" class="asset">
			{#if row.asset_name}
				<LendingReserveLabel hideChainIcon reserve={row as LendingReserve} />
			{:else}
				---
			{/if}
		</td>
		<td style:width="9ch">{format(row.protocol_name)}</td>
		<td style:width="9ch">{formatDollar(row.totalLiquidityUSD)}</td>
	{/snippet}
</TradingEntitiesTable>
