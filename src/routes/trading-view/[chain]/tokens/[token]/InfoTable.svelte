<script lang="ts">
	import { formatAmount, formatDollar } from '$lib/helpers/formatters';
	import { getTokenStandardName } from '$lib/chain/tokenstandard';
	import { TradingDataInfo, TradingDataInfoRow } from '$lib/components';

	export let token: any;
</script>

<TradingDataInfo>
	<TradingDataInfoRow label="Name" value={token.name} />
	<TradingDataInfoRow label="Token symbol" value={token.symbol} />
	<TradingDataInfoRow label="Total supply" value="{formatAmount(token.total_supply)} {token.symbol}" />
	<TradingDataInfoRow label="Standard" value={getTokenStandardName(token.chain_slug)} />
	<TradingDataInfoRow label="Available liquidity" value={formatDollar(token.liquidity_latest)} />
	<TradingDataInfoRow label="Volume 24h" value={formatDollar(token.volume_24h)} />
	<TradingDataInfoRow label="Blockchain">
		<a slot="value" href="/trading-view/{token.chain_slug}">{token.chain_name}</a>
	</TradingDataInfoRow>
	<TradingDataInfoRow value={token.token_id}>
		<a slot="label" href="https://tradingstrategy.ai/docs/programming/market-data/internal-id.html" rel="external"
			>Internal id</a
		>
	</TradingDataInfoRow>
</TradingDataInfo>
