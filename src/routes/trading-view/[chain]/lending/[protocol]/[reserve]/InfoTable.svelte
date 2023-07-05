<script lang="ts">
	import { TradingDataInfo, TradingDataInfoRow } from '$lib/components';

	export let reserve: Record<string, any>;
</script>

<TradingDataInfo>
	<TradingDataInfoRow label="Protocol" value={reserve.protocol_name} />
	<TradingDataInfoRow label="Symbol" value={reserve.asset_symbol} />
	<TradingDataInfoRow
		label="aToken"
		value={reserve.atoken_id}
		valueHref="/trading-view/{reserve.chain_slug}/tokens/{reserve.atoken_address}"
	/>
	<TradingDataInfoRow
		label="Stable debt token"
		value={reserve.stable_debt_token_id}
		valueHref="/trading-view/{reserve.chain_slug}/tokens/{reserve.stable_debt_token_address}"
	/>
	<TradingDataInfoRow
		label="Variable debt token"
		value={reserve.variable_debt_token_id}
		valueHref="/trading-view/{reserve.chain_slug}/tokens/{reserve.variable_debt_token_address}"
	/>
</TradingDataInfo>
