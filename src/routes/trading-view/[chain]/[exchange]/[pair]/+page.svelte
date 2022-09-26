<!--
Render the pair trading page
- Core pair data loaded during SSR (see +page.ts)
- Detailed candle data is delayed until client-side (though the first run could be done in SSR)
- Selected time bucket (for charts) is carried over in URL fragment; this could
  be moved to SvelteKit routing query parameter
-->
<script lang="ts">
	import type { PageData } from './$types';
	import { getTokenTaxInformation } from '$lib/helpers/tokentax';
	import { Button } from '$lib/components';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import InfoTable from './InfoTable.svelte';
	import InfoSummary from './InfoSummary.svelte';
	import ChartSection from './ChartSection.svelte';
	import TimeSpanPerformance from './TimeSpanPerformance.svelte';

	export let data: PageData;

	$: summary = data.summary;
	$: details = data.additional_details;

	$: tokenTax = getTokenTaxInformation(details);

	// Ridiculous token price warning: it is common with scam tokens to price the
	// token super low so that prices are not readable when converted to USD.
	$: ridiculousPrice = summary.usd_price_latest < 0.000001;

	$: breadcrumbs = {
		[summary.exchange_slug]: summary.exchange_name,
		[summary.pair_slug]: summary.pair_name
	};
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

<Breadcrumbs labels={breadcrumbs} />

<main>
	<header class="ds-container">
		<h1>
			{summary.pair_symbol}
			<small>token pair on {details.exchange_name} on {details.chain_name}</small>
		</h1>
	</header>

	<section class="ds-container ds-2-col">
		<InfoTable {summary} {details} />
		<InfoSummary {summary} {details} />
	</section>

	<section class="ds-container">
		{#if tokenTax.broken}
			<div class="alert alert-danger">
				⚠️ This token is unlikely to be tradeable.
				<a
					rel="external"
					class="body-link"
					href="https://tradingstrategy.ai/docs/programming/market-data/token-tax.html#honeypots-and-other-rug-pull-risks"
					>Read more about transfer fees being broken or malicious in the token tax documentation.</a
				>. Error code <strong>{tokenTax.sellTax}</strong>.
			</div>
		{/if}

		{#if ridiculousPrice}
			<div class="alert alert-danger">
				⚠️ This trading pair is using low digit price units that may prevent displaying the price data properly.
			</div>
		{/if}
	</section>

	<section class="ds-container">
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
	</section>

	<section class="ds-container charts">
		<ChartSection pairId={summary.pair_id} pairSymbol={summary.pair_symbol} firstTradeDate={details.first_trade_at} />
	</section>

	<section class="ds-container time-period-summaries">
		<h2>Time period summary</h2>

		<p>
			The price and liquidity of <strong>{summary.base_token_symbol_friendly}</strong> in this trading pair. The amounts
			are converted to US dollar through
			<strong>{summary.quote_token_symbol_friendly}/USD</strong>.
		</p>

		<div class="time-span-wrapper">
			<TimeSpanPerformance pairId={summary.pair_id} period="hourly" />
			<TimeSpanPerformance pairId={summary.pair_id} period="daily" />
			<TimeSpanPerformance pairId={summary.pair_id} period="weekly" />
			<TimeSpanPerformance pairId={summary.pair_id} period="monthly" />
		</div>
	</section>
</main>

<style>
	main {
		display: grid;
		gap: 1rem;
	}

	h1 {
		font: var(--f-h1-bold);
	}

	h1 small {
		display: block;
		font: var(--f-h4-medium);
		color: var(--c-text-2);
	}

	.trade-actions {
		margin-bottom: 1rem;
		display: flex;
		flex-wrap: wrap;
		gap: 1.5rem;
	}

	.charts {
		/* prevent chart-flicker bug when scrollbars are enabled */
		overflow: visible;
	}

	.time-period-summaries {
		grid-template-columns: auto;
		gap: 1rem;
	}

	.time-span-wrapper {
		display: grid;
		gap: 2rem 4rem;
	}

	@media (--viewport-md-up) {
		.time-span-wrapper {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (--viewport-lg-up) {
		.time-span-wrapper {
			grid-template-columns: repeat(4, 1fr);
		}
	}
</style>
