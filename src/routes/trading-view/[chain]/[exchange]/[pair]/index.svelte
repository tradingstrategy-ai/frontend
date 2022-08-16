<!--
Render the pair trading page
- Load core pair data during SSR
- Detailed candle data loading is delayed to the client-side (though in theory
  the first run could be done in SSR)
- Selected time bucket (for charts) is carried over in URL fragment; this could
  be moved to SvelteKit routing query parameter
-->
<script context="module">
	import getApiError from '$lib/chain/getApiError';
	import { getTokenTaxInformation } from '$lib/helpers/tokentax';

	// During SSR we only load only pair details; all trading data (price and
	// liquidity candles, trading summaries) are done client-side.
	export async function load({ url, params, fetch, session }) {
		const { backendUrl } = session.config;
		const exchange_slug = params.exchange;
		const chain_slug = params.chain;
		const pair_slug = params.pair;
		const encoded = new URLSearchParams({ exchange_slug, chain_slug, pair_slug });
		const apiUrl = `${backendUrl}/pair-details?${encoded}`;

		const resp = await fetch(apiUrl);

		if (!resp.ok) {
			return getApiError(resp, 'Trading pair', [chain_slug, exchange_slug, pair_slug]);
		}

		const pairDetails = await resp.json();

		const summary = pairDetails.summary;
		const details = pairDetails.additional_details;

		console.log('Pair page, summary', summary);
		console.log('Pair page, details', details);

		const tokenTax = getTokenTaxInformation(details);

		return {
			// Cache the pair data pages for 30 minutes at the Cloudflare edge,
			// so the pages are served really fast if they get popular,
			// and also for speed test
			maxage: 30 * 60, // 30 minutes,
			props: {
				exchange_slug,
				chain_slug,
				summary,
				details,
				tokenTax
			}
		};
	}
</script>

<script lang="ts">
	import { formatDollar } from '$lib/helpers/formatters';
	import { formatPriceChange } from '$lib/helpers/formatters';
	import { determinePriceChangeClass } from '$lib/helpers/price';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import PairInfoTable from '$lib/content/PairInfoTable.svelte';
	import TimeSpanPerformance from '$lib/chart/TimeSpanPerformance.svelte';
	import RelativeDate from '$lib/blog/RelativeDate.svelte';
	import type { TokenTax } from '$lib/helpers/tokentax';
	import ChartSection from './_ChartSection.svelte';
	import Button from '$lib/components/Button.svelte';

	export let exchange_slug;
	export let chain_slug;
	export let summary; // PairSummary OpenAPI
	export let details; // PairAdditionalDetails OpenAPI
	export let tokenTax: TokenTax;

	$: breadcrumbs = {
		[exchange_slug]: details.exchange_name,
		[summary.pair_slug]: summary.pair_name
	};

	// Ridiculous token price warning:
	// It is common with scam tokens to price the token super low so that
	// prices are not readable when converted to USD.
	$: ridiculousPrice = summary.usd_price_latest < 0.000001;

	$: priceChangeColorClass = determinePriceChangeClass(summary.price_change_24h);

	// TODO: Fix this in the data source
	$: [baseTokenName, quoteTokenName] = summary.pair_name.split('-');
</script>

<svelte:head>
	<title>
		{summary.pair_symbol} token price on {details.exchange_name}
	</title>
	<meta
		name="description"
		content={`Price and liquidity for ${summary.pair_symbol} on ${details.exchange_name} on ${details.chain_name}`}
	/>
</svelte:head>

<div class="container">
	<Breadcrumbs labels={breadcrumbs} />

	<div class="text-section">
		<div class="row">
			<div class="col-md-12">
				<h1>
					{summary.pair_symbol} token pair on
					{details.exchange_name}
					on {details.chain_name}
				</h1>
			</div>
		</div>

		<div class="row">
			<div class="col-lg-5">
				<PairInfoTable {summary} {details} {tokenTax} />
			</div>

			<div class="col-lg-7">
				<p>
					The token pair

					<a class="body-link" href="/trading-view/{summary.chain_slug}/tokens/{summary.base_token_address}">
						{baseTokenName}
					</a>

					–

					<a class="body-link" href="/trading-view/{summary.chain_slug}/tokens/{summary.quote_token_address}">
						{quoteTokenName}
					</a>

					trades as the ticker

					<strong>{summary.pair_symbol}</strong> on
					<a class="body-link" href="/trading-view/{chain_slug}/{exchange_slug}">{details.exchange_name} exchange</a>
					on
					<a class="body-link" href="/trading-view/{chain_slug}">{details.chain_name} blockchain</a>.
				</p>

				<p>
					The price of <a
						class="body-link"
						href="/trading-view/{summary.chain_slug}/tokens/{summary.base_token_address}"
					>
						{summary.base_token_symbol}
					</a>
					in <strong>{summary.pair_symbol}</strong> pair is
					<strong class={priceChangeColorClass}>{formatDollar(summary.usd_price_latest)}</strong>
					and is
					<strong class={priceChangeColorClass}
						>{formatPriceChange(summary.price_change_24h)}
						{summary.price_change_24h > 0 ? 'up' : 'down'}</strong
					> against US Dollar for the last 24h.
				</p>

				<p>
					The pair has <strong>{formatDollar(summary.usd_volume_24h)}</strong> 24h trading volume with
					<strong>{formatDollar(summary.usd_liquidity_latest)}</strong>
					liquidity available at the moment. The trading of {summary.pair_symbol} started at
					<strong><RelativeDate timestamp={details.first_trade_at} /></strong>. The last trade was seen less than
					<strong><RelativeDate hours timestamp={details.last_trade_at} /></strong>.
				</p>

				{#if details.pair_contract_address}
					<p>
						The trading pair pool smart contract is at address <a href={details.pair_explorer_link} class="body-link"
							>{details.pair_contract_address}</a
						>.
					</p>
				{/if}
			</div>
		</div>
	</div>

	<div class="row">
		<div class="col-md-12">
			{#if tokenTax.broken}
				<div class="alert alert-danger">
					⚠️ This token is unlikely to be tradeable.
					<a
						rel="external"
						class="body-link"
						href="https://tradingstrategy.ai/docs/programming/market-data/token-tax.html#honeypots-and-other-rug-pull-risks"
					>
						Read more about transfer fees being broken or malicious in the token tax documentation.
					</a>. Error code <strong>{tokenTax.sellTax}<strong>. </strong></strong>
				</div>
			{/if}

			{#if ridiculousPrice}
				<div class="alert alert-danger">
					⚠️ This trading pair is using low digit price units that may prevent displaying the price data properly.
				</div>
			{/if}
		</div>
	</div>

	<div class="row">
		<div class="col-md-12">
			<div class="trade-actions">
				<Button secondary label="Buy {summary.base_token_symbol_friendly}" href={details.buy_link} />
				<Button secondary label="Sell {summary.base_token_symbol_friendly}" href={details.sell_link} />
				<Button secondary label="Blockchain explorer" href={details.explorer_link} />
				<Button
					secondary
					label="{summary.pair_symbol} API and historical data"
					href="/trading-view/{summary.chain_slug}/{summary.exchange_slug}/{summary.pair_slug}/api-and-historical-data"
				/>
			</div>
		</div>
	</div>

	<ChartSection pairId={summary.pair_id} pairSymbol={summary.pair_symbol} firstTradeDate={details.first_trade_at} />

	<h2>Time period summary</h2>

	<p>
		The price and liquidity of <strong>{summary.base_token_symbol_friendly}</strong> in this trading pair. The amounts
		are converted to US dollar through
		<strong>{summary.quote_token_symbol_friendly}/USD</strong>.
	</p>

	<div class="row">
		<div class="col-lg-3 col-md-6">
			<div class="time-span-wrapper">
				<TimeSpanPerformance pairId={summary.pair_id} period="hourly" />
			</div>
		</div>
		<div class="col-lg-3 col-md-6">
			<div class="time-span-wrapper">
				<TimeSpanPerformance pairId={summary.pair_id} period="daily" />
			</div>
		</div>
		<div class="col-lg-3 col-md-6">
			<div class="time-span-wrapper">
				<TimeSpanPerformance pairId={summary.pair_id} period="weekly" />
			</div>
		</div>
		<div class="col-lg-3 col-md-6">
			<div class="time-span-wrapper">
				<TimeSpanPerformance pairId={summary.pair_id} period="monthly" />
			</div>
		</div>
	</div>
</div>

<style>
	/**
    * Decrease the main heading font size so we can fit on a single row:
    * > BNB-BUSD trading on PancakeSwap v2 on Binance Smart Chain
    *
    * Note that 2rem is different size for Firefox and Chrome
    */
	h1 {
		font-size: 2rem;
		margin-bottom: 20px;
	}

	h2 {
		font-size: 2rem;
	}

	.text-section {
		margin-top: 20px;
	}

	.time-span-wrapper {
		margin: 0 auto;
	}

	.trade-actions {
		margin-block: 1rem 2rem;
		display: flex;
		flex-wrap: wrap;
		gap: 1.5rem;
	}
</style>
