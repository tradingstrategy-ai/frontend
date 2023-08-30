<script lang="ts">
	import { formatDollar, formatSwapFee, formatPriceChange } from '$lib/helpers/formatters';
	import { determinePriceChangeClass } from '$lib/helpers/price';
	import { getTokenTaxDescription, tokenTaxDocsUrl } from '$lib/helpers/tokentax';
	import { TradingDataInfo, TradingDataInfoRow } from '$lib/components';

	export let summary: Record<string, any>;
	export let details: Record<string, any>;

	// Reverse-calculate raw price using the US/quota token exchange rate
	function calculateTokenPrice(exchangeRate: number, priceUsd: number) {
		return exchangeRate ? priceUsd / exchangeRate : null;
	}

	$: tokenPrice = calculateTokenPrice(summary.exchange_rate, summary.usd_price_latest);
	$: priceChangeColorClass = determinePriceChangeClass(summary.price_change_24h);
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
		<span slot="value" class={priceChangeColorClass}>
			{formatDollar(summary.usd_price_latest, 3, 3, '')} USD
		</span>
	</TradingDataInfoRow>

	{#if tokenPrice}
		<TradingDataInfoRow label="Token price">
			<span slot="value" class={priceChangeColorClass}>
				{formatDollar(tokenPrice, 3, 3, '')}
				{summary.quote_token_symbol_friendly}
			</span>
		</TradingDataInfoRow>
	{/if}

	<TradingDataInfoRow label="Change 24h">
		<span slot="value" class={priceChangeColorClass}>
			{formatPriceChange(summary.price_change_24h)}
		</span>
	</TradingDataInfoRow>

	<TradingDataInfoRow label="Volume 24h" value={formatDollar(summary.usd_volume_24h)} />

	{#if summary.liquidity_type === 'xyliquidity'}
		<TradingDataInfoRow label="Liquidity" value={formatDollar(summary.usd_liquidity_latest)} />
	{/if}

	{#if Number.isFinite(summary.pair_tvl)}
		<TradingDataInfoRow label="TVL" value={formatDollar(summary.pair_tvl)} />
	{/if}

	{#if summary.exchange_rate}
		<TradingDataInfoRow label="Dollar exchange rate">
			<svelte:fragment slot="value">
				{formatDollar(summary.exchange_rate, 3, 3, '')} USD /
				{summary.quote_token_symbol_friendly}
			</svelte:fragment>
		</TradingDataInfoRow>
	{/if}

	<TradingDataInfoRow value={getTokenTaxDescription(details)}>
		<a slot="label" href={tokenTaxDocsUrl}>Token tax</a>
	</TradingDataInfoRow>

	{#if summary.pool_swap_fee}
		<TradingDataInfoRow label="Swap fee" value={formatSwapFee(summary.pool_swap_fee)} />
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
		<a slot="label" href="https://tradingstrategy.ai/docs/programming/market-data/internal-id.html">Internal id</a>
	</TradingDataInfoRow>
</TradingDataInfo>
