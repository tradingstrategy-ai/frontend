<script lang="ts">
	import { Timestamp, Tooltip, TradingDataInfo, TradingDataInfoRow } from '$lib/components';
	import { formatDollar, formatSwapFee, formatTokenAmount } from '$lib/helpers/formatters';
	import { getProfitInfo } from '$lib/components/Profitability.svelte';

	export let summary: Record<string, any>;
	export let details: Record<string, any>;

	$: priceChange = getProfitInfo(summary.price_change_24h);

	$: tokenPrice = calculateTokenPrice(summary.exchange_rate, summary.usd_price_latest);

	// Reverse-calculate raw price using the US/quota token exchange rate
	function calculateTokenPrice(exchangeRate: number, priceUsd: number) {
		return exchangeRate ? priceUsd / exchangeRate : null;
	}
</script>

<TradingDataInfo>
	<TradingDataInfoRow label="Token">
		<a slot="value" href="/trading-view/{summary.chain_slug}/tokens/{summary.base_token_address}">
			{summary.base_token_symbol_friendly}
		</a>
	</TradingDataInfoRow>

	<TradingDataInfoRow label="Quoted in">
		<a slot="value" href="/trading-view/{summary.chain_slug}/tokens/{summary.quote_token_address}">
			{summary.quote_token_symbol_friendly}
		</a>
	</TradingDataInfoRow>

	<TradingDataInfoRow label="Price">
		<span slot="value" class={priceChange.directionClass}>
			{formatTokenAmount(summary.usd_price_latest, 3)} USD
		</span>
	</TradingDataInfoRow>

	{#if tokenPrice}
		<TradingDataInfoRow label="Token price">
			<span slot="value" class={priceChange.directionClass}>
				{formatTokenAmount(tokenPrice, 3)}
				{summary.quote_token_symbol_friendly}
			</span>
		</TradingDataInfoRow>
	{/if}

	<TradingDataInfoRow label="Change 24h">
		<span slot="value" class={priceChange.directionClass}>
			{priceChange}
		</span>
	</TradingDataInfoRow>

	<TradingDataInfoRow label="Volume 24h" value={formatDollar(summary.usd_volume_24h)} />

	{#if Number.isFinite(summary.pair_tvl)}
		<TradingDataInfoRow label="TVL">
			<Tooltip slot="value">
				<span slot="trigger" class="underline">
					{formatDollar(summary.pair_tvl)}
				</span>
				<svelte:fragment slot="popup">
					<Timestamp date={summary.pair_tvl_last_updated} let:dateStr let:timeStr let:relative>
						Updated {relative}<br />
						{dateStr}
						{timeStr} UTC
					</Timestamp>
				</svelte:fragment>
			</Tooltip>
		</TradingDataInfoRow>
	{/if}

	{#if summary.exchange_rate}
		<TradingDataInfoRow label="Dollar exchange rate">
			<svelte:fragment slot="value">
				{formatTokenAmount(summary.exchange_rate, 3)} USD /
				{summary.quote_token_symbol_friendly}
			</svelte:fragment>
		</TradingDataInfoRow>
	{/if}

	{#if summary.pair_swap_fee}
		<TradingDataInfoRow label="Trading fee" value={formatSwapFee(summary.pair_swap_fee)} />
	{/if}

	<TradingDataInfoRow label="Exchange">
		<a slot="value" href="/trading-view/{summary.chain_slug}/{summary.exchange_slug}">
			{details.exchange_name}
		</a>
	</TradingDataInfoRow>

	<TradingDataInfoRow label="Blockchain">
		<a slot="value" href="/trading-view/{summary.chain_slug}">
			{details.chain_name}
		</a>
	</TradingDataInfoRow>

	<TradingDataInfoRow value={summary.pair_id}>
		<a slot="label" href="https://tradingstrategy.ai/docs/programming/market-data/internal-id.html" rel="external"
			>Internal id</a
		>
	</TradingDataInfoRow>
</TradingDataInfo>
