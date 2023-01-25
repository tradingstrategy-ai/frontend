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
	<TradingDataInfoRow
		label="Token"
		value={summary.base_token_symbol_friendly}
		valueHref="/trading-view/{summary.chain_slug}/tokens/{summary.base_token_address}"
	/>

	<TradingDataInfoRow
		label="Quoted in"
		value={summary.quote_token_symbol_friendly}
		valueHref="/trading-view/{summary.chain_slug}/tokens/{summary.quote_token_address}"
	/>

	<TradingDataInfoRow
		label="Price"
		value="{formatDollar(summary.usd_price_latest, 3, 3, '')} USD"
		class={priceChangeColorClass}
	/>

	{#if tokenPrice}
		<TradingDataInfoRow
			label="Token price"
			value="{formatDollar(tokenPrice, 3, 3, '')} {summary.quote_token_symbol_friendly}"
			class={priceChangeColorClass}
		/>
	{/if}

	<TradingDataInfoRow
		label="Change 24h"
		value={formatPriceChange(summary.price_change_24h)}
		class={priceChangeColorClass}
	/>

	<TradingDataInfoRow label="Volume 24h" value={formatDollar(summary.usd_volume_24h)} />

	<TradingDataInfoRow label="Liquidity" value={formatDollar(summary.usd_liquidity_latest)} />

	{#if summary.exchange_rate}
		<TradingDataInfoRow
			label="Dollar exchange rate"
			value="{formatDollar(summary.exchange_rate, 3, 3, '')} USD / {summary.quote_token_symbol_friendly}"
		/>
	{/if}

	<TradingDataInfoRow label="Token tax" labelHref={tokenTaxDocsUrl} value={getTokenTaxDescription(details)} />

	{#if summary.pool_swap_fee}
		<TradingDataInfoRow label="Swap fee" value={formatSwapFee(summary.pool_swap_fee)} />
	{/if}

	<TradingDataInfoRow
		label="Exchange"
		value={details.exchange_name}
		valueHref="/trading-view/{summary.chain_slug}/{summary.exchange_slug}"
	/>

	<TradingDataInfoRow label="Blockchain" value={details.chain_name} valueHref="/trading-view/{summary.chain_slug}" />

	<TradingDataInfoRow
		label="Internal id"
		labelHref="https://tradingstrategy.ai/docs/programming/market-data/internal-id.html"
		value={summary.pair_id}
	/>
</TradingDataInfo>
