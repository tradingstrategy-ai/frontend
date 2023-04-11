<script lang="ts">
	import { TradingDataInfo, TradingDataInfoRow } from '$lib/components';

	export let protocolName: string;
	export let chain: Record<string, any>;
	export let reserve: Record<string, any>;
</script>

<TradingDataInfo>
	<TradingDataInfoRow label="Protocol" value={protocolName} />
	<TradingDataInfoRow label="Symbol" value={reserve.asset_symbol} />
	<TradingDataInfoRow
		label="aToken"
		value={reserve.atoken_id}
		valueHref="/trading-view/{chain.chain_slug}/tokens/{reserve.atoken_address}"
	/>
	<TradingDataInfoRow
		label="Stable debt token"
		value={reserve.stable_debt_token_id}
		valueHref="/trading-view/{chain.chain_slug}/tokens/{reserve.stable_debt_token_address}"
	/>
	<TradingDataInfoRow
		label="Variable debt token"
		value={reserve.variable_debt_token_id}
		valueHref="/trading-view/{chain.chain_slug}/tokens/{reserve.variable_debt_token_address}"
	/>
</TradingDataInfo>
