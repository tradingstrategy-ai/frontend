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
	import { AlertItem, AlertList, Button, PageHeader } from '$lib/components';
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
	<PageHeader title={summary.pair_symbol} subtitle="token pair on {details.exchange_name} on {details.chain_name}" />

	<section class="ds-container info" data-testid="pair-info">
		<div class="ds-2-col">
			<InfoTable {summary} {details} />
			<InfoSummary {summary} {details} />
		</div>

		<AlertList status="warning">
			<AlertItem title="Uniswap V3 beta" displayWhen={summary.exchange_type === 'uniswap_v3'}>
				We are in the process of integrating Uniswap V3 data. This page is available as a beta preview, but please note
				that the data for this trading pair is currently incomplete.
			</AlertItem>

			<AlertItem displayWhen={tokenTax.broken}>
				This token is unlikely to be tradeable.
				<a
					href="https://tradingstrategy.ai/docs/programming/market-data/token-tax.html#honeypots-and-other-rug-pull-risks"
					>Read more about transfer fees being broken or malicious in the token tax documentation</a
				>. Error code <strong>{tokenTax.sellTax}</strong>.
			</AlertItem>

			<AlertItem displayWhen={ridiculousPrice}>
				This trading pair is using low digit price units that may prevent displaying the price data properly.
			</AlertItem>
		</AlertList>

		<div class="trade-actions">
			<Button label="Buy {summary.base_token_symbol_friendly}" href={details.buy_link} />
			<Button label="Sell {summary.base_token_symbol_friendly}" href={details.sell_link} />
			<Button label="Blockchain explorer" href={details.explorer_link} />
			<Button
				label="{summary.pair_symbol} API and historical data"
				href="./{summary.pair_slug}/api-and-historical-data"
			/>
		</div>
	</section>

	<section class="ds-container charts">
		<ChartSection
			pairId={summary.pair_id}
			pairSymbol={summary.pair_symbol}
			exchangeType={summary.exchange_type}
			firstTradeDate={details.first_trade_at}
		/>
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
		gap: var(--space-3xl);

		@media (--viewport-lg-up) {
			gap: 5rem;
		}
	}

	.info {
		gap: var(--space-3xl);

		@media (--viewport-lg-up) {
			gap: var(--space-6xl);
		}

		& .ds-2-col {
			row-gap: var(--space-xl);
			align-items: start;
		}
	}

	.trade-actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: var(--space-ls) var(--space-xl);
		padding-block: var(--space-lg);

		@media (--viewport-xs) {
			flex-direction: column;
			padding-block: 0;
		}
	}

	.charts {
		/* prevent chart-flicker bug when scrollbars are enabled */
		overflow: visible;
	}

	.time-period-summary {
		display: grid;
		gap: var(--space-2xl);

		@media (--viewport-lg-up) {
			gap: var(--space-7xl);
		}

		& header {
			display: grid;
			gap: var(--space-sl);
		}

		& h2 {
			font: var(--f-h1-medium);
		}

		& p {
			font: var(--f-h4-roman);
		}
	}
</style>
