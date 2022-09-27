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
	import { Button, Icon } from '$lib/components';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import InfoTable from './InfoTable.svelte';
	import InfoSummary from './InfoSummary.svelte';
	import ChartSection from './ChartSection.svelte';
	import TimePeriodSummaryTable from './TimePeriodSummaryTable.svelte';

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

	<section class="ds-container info">
		<div class="ds-2-col">
			<InfoTable {summary} {details} />
			<InfoSummary {summary} {details} />
		</div>

		{#if tokenTax.broken || ridiculousPrice}
			<ul class="alerts">
				{#if tokenTax.broken}
					<li>
						<span><Icon name="warning" /></span>
						<span>
							This token is unlikely to be tradeable.
							<a
								href="https://tradingstrategy.ai/docs/programming/market-data/token-tax.html#honeypots-and-other-rug-pull-risks"
								>Read more about transfer fees being broken or malicious in the token tax documentation</a
							>. Error code <strong>{tokenTax.sellTax}</strong>.
						</span>
					</li>
				{/if}

				{#if ridiculousPrice}
					<li>
						<span><Icon name="warning" /></span>
						<span
							>This trading pair is using low digit price units that may prevent displaying the price data properly.</span
						>
					</li>
				{/if}
			</ul>
		{/if}

		<div class="trade-actions">
			<Button label="Buy {summary.base_token_symbol_friendly}" href={details.buy_link} />
			<Button label="Sell {summary.base_token_symbol_friendly}" href={details.sell_link} />
			<Button label="Blockchain explorer" href={details.explorer_link} />
			<Button
				label="{summary.pair_symbol} API and historical data"
				href="/trading-view/{summary.chain_slug}/{summary.exchange_slug}/{summary.pair_slug}/api-and-historical-data"
			/>
		</div>
	</section>

	<section class="ds-container charts">
		<ChartSection pairId={summary.pair_id} pairSymbol={summary.pair_symbol} firstTradeDate={details.first_trade_at} />
	</section>

	<section class="ds-container time-period-summary">
		<header>
			<h2>Time period summary</h2>
			<p>
				The price and liquidity of {summary.base_token_symbol_friendly} in this trading pair. The amounts are converted to
				US dollar through {summary.quote_token_symbol_friendly}/USD.
			</p>
		</header>

		<TimePeriodSummaryTable pairId={summary.pair_id} />
	</section>
</main>

<style lang="postcss">
	main {
		display: grid;
		gap: 2.5rem;

		@media (--viewport-lg-up) {
			gap: 5rem;
		}
	}

	h1 {
		font: var(--f-h1-bold);

		& small {
			display: block;
			font: var(--f-h4-medium);
			color: var(--c-text-2);
		}
	}

	.info {
		gap: 2.5rem;

		@media (--viewport-lg-up) {
			gap: 3.5rem;
		}
	}

	.trade-actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 1.25rem 2rem;
		padding-block: 1.5rem;

		@media (width < 576px) {
			flex-direction: column;
			padding-block: 0;
		}
	}

	.alerts {
		display: grid;
		gap: 1.5rem;
		max-width: 1020px;
		margin-inline: auto;
		padding: 1.25em;
		border: 2px solid var(--c-bearish);
		list-style: none;
		font: var(--f-ui-large-roman);

		& li {
			display: flex;
			gap: 0.75rem;
			font: inherit;

			& :global svg {
				color: var(--c-bearish);
				transform: translateY(-2px);
			}

			& a {
				font-weight: 500;
				text-decoration: underline;
			}
		}
	}

	.charts {
		/* prevent chart-flicker bug when scrollbars are enabled */
		overflow: visible;
	}

	.time-period-summary {
		display: grid;
		gap: 2.25rem;

		@media (--viewport-lg-up) {
			gap: 4rem;
		}

		& header {
			display: grid;
			gap: 0.75rem;
		}

		& h2 {
			font: var(--f-h1-medium);
		}

		& p {
			font: var(--f-h4-roman);
		}
	}
</style>
