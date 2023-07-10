<script lang="ts">
	import { TradingDataInfo, TradingDataInfoRow } from '$lib/components';
	import { formatInterestRate } from '$lib/helpers/formatters';

	export let reserve: Record<string, any>;
</script>

<TradingDataInfo>
	<TradingDataInfoRow
		label="Supply rate"
		value="{formatInterestRate(reserve.additional_details.supply_apr_latest)} APR"
	/>
	<TradingDataInfoRow
		label="Borrow rate – variable"
		value="{formatInterestRate(reserve.additional_details.variable_borrow_apr_latest)} APR"
	/>
	<TradingDataInfoRow
		label="Borrow rate – stable"
		value="{formatInterestRate(reserve.additional_details.stable_borrow_apr_latest)} APR"
	/>
	<TradingDataInfoRow label="Protocol" value={reserve.protocol_name} />
	<TradingDataInfoRow
		label="Asset Token"
		value={reserve.asset_name}
		valueHref="/trading-view/{reserve.chain_slug}/tokens/{reserve.asset_address}"
	/>
	<TradingDataInfoRow label="Blockchain" value={reserve.chain_name} valueHref="/trading-view/{reserve.chain_slug}" />
</TradingDataInfo>
