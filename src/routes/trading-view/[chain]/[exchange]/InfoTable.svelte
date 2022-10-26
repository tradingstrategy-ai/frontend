<!--
@component
Render exchange summary table on exchange page.
-->
<script lang="ts">
	import { fromUnixTime, format } from 'date-fns';
	import { formatAmount, formatDollar, formatUrlAsDomain } from '$lib/helpers/formatters';
	import type { ExchangeNameInfo } from '$lib/helpers/exchange';
	import { exchangeTypeLabel } from '$lib/helpers/exchange';
	import { TradingDataInfoRow } from '$lib/components';

	export let details: any;
	export let nameDetails: ExchangeNameInfo;
</script>

<table>
	<TradingDataInfoRow label="Name" value={nameDetails.name} />

	<TradingDataInfoRow
		label="Homepage"
		value={details.homepage ? formatUrlAsDomain(details.homepage) : 'Not available'}
		valueHref={details.homepage}
	/>

	<TradingDataInfoRow
		label="Volume 30d"
		labelHref="https://tradingstrategy.ai/docs/programming/market-data/tracking.html#volume-calculations"
		value={formatDollar((details.buy_volume_30d || 0) + (details.sell_volume_30d || 0))}
	/>

	<TradingDataInfoRow
		label="Volume all-time"
		labelHref="https://tradingstrategy.ai/docs/programming/market-data/tracking.html#volume-calculations"
		value={formatDollar((details.buy_volume_all_time || 0) + (details.sell_volume_all_time || 0))}
	/>

	<TradingDataInfoRow label="Trading pairs" value={formatAmount(details.pair_count)} />

	<TradingDataInfoRow
		label="Tracked trading pairs"
		labelHref="https://tradingstrategy.ai/docs/programming/market-data/tracking.html"
		value={formatAmount(details.active_pair_count)}
	/>

	{#if details.first_trade_at}
		<TradingDataInfoRow label="Launched" value={format(fromUnixTime(details.first_trade_at), 'MMM yyyy')} />
	{/if}

	{#if nameDetails.version !== 1}
		<TradingDataInfoRow label="Version" value={nameDetails.version} />
	{/if}

	<TradingDataInfoRow label="Type" value={exchangeTypeLabel(details.exchange_type)} />

	<TradingDataInfoRow label="Blockchain" value={details.chain_name} valueHref="/trading-view/{details.chain_slug}" />

	<TradingDataInfoRow
		label="Internal id"
		labelHref="https://tradingstrategy.ai/docs/programming/market-data/internal-id.html"
		value={details.exchange_id}
		valueHref=""
	/>
</table>
