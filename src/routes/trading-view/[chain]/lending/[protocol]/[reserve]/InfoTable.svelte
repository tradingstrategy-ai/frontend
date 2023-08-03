<script lang="ts">
	import { TradingDataInfo, TradingDataInfoRow } from '$lib/components';
	import type { Reserve } from '$lib/helpers/lending-reserve';
	import { formatInterestRate } from '$lib/helpers/formatters';

	export let reserve: Reserve;
	export let borrowable: boolean;

	$: details = reserve.additional_details;
</script>

<TradingDataInfo>
	<TradingDataInfoRow label="Supply rate">
		{formatInterestRate(details.supply_apr_latest)} APR
	</TradingDataInfoRow>
	<TradingDataInfoRow label="Borrow rate – variable">
		{#if borrowable}
			{formatInterestRate(details.variable_borrow_apr_latest)} APR
		{:else}
			N/A
		{/if}
	</TradingDataInfoRow>
	<TradingDataInfoRow label="Borrow rate – stable">
		{#if borrowable}
			{formatInterestRate(details.stable_borrow_apr_latest)} APR
		{:else}
			N/A
		{/if}
	</TradingDataInfoRow>
	<TradingDataInfoRow label="Protocol" value={reserve.protocol_name} />
	<TradingDataInfoRow
		label="Asset Token"
		value={reserve.asset_name}
		valueHref="/trading-view/{reserve.chain_slug}/tokens/{reserve.asset_address}"
	/>
	<TradingDataInfoRow label="Blockchain" value={reserve.chain_name} valueHref="/trading-view/{reserve.chain_slug}" />
</TradingDataInfo>
