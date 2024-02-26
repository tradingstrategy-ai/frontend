<!--
@component
Render exchange summary table on exchange page.
-->
<script lang="ts">
	import { fromUnixTime, format } from 'date-fns';
	import { formatAmount, formatDollar, formatUrlAsDomain } from '$lib/helpers/formatters';
	import type { ExchangeNameInfo } from '$lib/helpers/exchange';
	import { exchangeTypeLabel } from '$lib/helpers/exchange';
	import { TradingDataInfo, TradingDataInfoRow } from '$lib/components';

	export let details: any;
	export let nameDetails: ExchangeNameInfo;
</script>

<TradingDataInfo>
	<TradingDataInfoRow label="Name" value={nameDetails.name} />

	<TradingDataInfoRow>
		<a
			slot="label"
			href="https://tradingstrategy.ai/docs/programming/market-data/tracking.html#volume-calculations"
			rel="external"
		>
			Volume 30d
		</a>
		<svelte:fragment slot="value">
			{formatDollar((details.buy_volume_30d ?? 0) + (details.sell_volume_30d ?? 0))}
		</svelte:fragment>
	</TradingDataInfoRow>

	<TradingDataInfoRow>
		<a
			slot="label"
			href="https://tradingstrategy.ai/docs/programming/market-data/tracking.html#volume-calculations"
			rel="external"
		>
			Volume all-time
		</a>
		<svelte:fragment slot="value">
			{formatDollar((details.buy_volume_all_time ?? 0) + (details.sell_volume_all_time ?? 0))}
		</svelte:fragment>
	</TradingDataInfoRow>

	<TradingDataInfoRow label="Trading pairs" value={formatAmount(details.pair_count)} />

	<TradingDataInfoRow value={formatAmount(details.active_pair_count)}>
		<a slot="label" href="https://tradingstrategy.ai/docs/programming/market-data/tracking.html" rel="external">
			Tracked trading pairs
		</a>
	</TradingDataInfoRow>

	{#if details.first_trade_at}
		<TradingDataInfoRow label="Launched" value={format(fromUnixTime(details.first_trade_at), 'MMM yyyy')} />
	{/if}

	{#if nameDetails.version !== 1}
		<TradingDataInfoRow label="Version" value={nameDetails.version} />
	{/if}

	<TradingDataInfoRow label="Type" value={exchangeTypeLabel(details.exchange_type)} />

	<TradingDataInfoRow label="Blockchain">
		<a slot="value" href="/trading-view/{details.chain_slug}">{details.chain_name}</a>
	</TradingDataInfoRow>

	<TradingDataInfoRow value={details.exchange_id}>
		<a slot="label" href="https://tradingstrategy.ai/docs/programming/market-data/internal-id.html" rel="external"
			>Internal id</a
		>
	</TradingDataInfoRow>
</TradingDataInfo>
