<script lang="ts">
	import { TradingDataInfo, TradingDataInfoRow } from '$lib/components';
	import type { Reserve } from '$lib/helpers/lending-reserve';
	import { formatInterestRate } from '$lib/helpers/formatters';

	export let reserve: Reserve;
	export let borrowable: boolean;

	$: details = reserve.additional_details;
</script>

<TradingDataInfo>
	<TradingDataInfoRow label="Supply rate" value="{formatInterestRate(details.supply_apr_latest)} APR" />
	<TradingDataInfoRow label="Borrow rate – variable">
		<svelte:fragment slot="value">
			{#if borrowable}
				{formatInterestRate(details.variable_borrow_apr_latest)} APR
			{:else}
				N/A
			{/if}
		</svelte:fragment>
	</TradingDataInfoRow>
	<TradingDataInfoRow label="Borrow rate – stable">
		<svelte:fragment slot="value">
			{#if borrowable}
				{formatInterestRate(details.stable_borrow_apr_latest)} APR
			{:else}
				N/A
			{/if}
		</svelte:fragment>
	</TradingDataInfoRow>
	<TradingDataInfoRow label="Protocol" value={reserve.protocol_name} />
	<TradingDataInfoRow label="Asset Token">
		<a slot="value" href="/trading-view/{reserve.chain_slug}/tokens/{reserve.asset_address}">
			{reserve.asset_name}
		</a>
	</TradingDataInfoRow>
	<TradingDataInfoRow label="Blockchain">
		<a slot="value" href="/trading-view/{reserve.chain_slug}">{reserve.chain_name}</a>
	</TradingDataInfoRow>
</TradingDataInfo>
