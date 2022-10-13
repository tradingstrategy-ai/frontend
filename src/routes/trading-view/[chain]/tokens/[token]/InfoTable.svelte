<script lang="ts">
	import { formatAmount, formatDollar } from '$lib/helpers/formatters';
	import { getTokenStandardName } from '$lib/chain/tokenstandard';
	import { TradingDataInfoRow } from '$lib/components';

	export let data: any;
</script>

<table>
	<TradingDataInfoRow label="Name" value={data.name} />
	<TradingDataInfoRow label="Token symbol" value={data.symbol} />
	<TradingDataInfoRow label="Total supply" value="{formatAmount(parseFloat(data.total_supply))} {data.symbol}" />
	<TradingDataInfoRow label="Standard" value={getTokenStandardName(data.chain_slug)} />
	<TradingDataInfoRow label="Available liquidity" value={formatDollar(data.liquidity_latest)} />
	<TradingDataInfoRow label="Volume 24h" value={formatDollar(data.volume_24h)} />
	<TradingDataInfoRow label="Blockchain" value={data.chain_name} valueHref="/trading-view/{data.chain_slug}" />
</table>
