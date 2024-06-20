<!--
Render the pair trading page
- Core pair data loaded during SSR (see +page.ts)
- Detailed candle data is delayed until client-side (though the first run could be done in SSR)
- Selected time bucket (for charts) is carried over in URL fragment; this could
  be moved to SvelteKit routing query parameter
-->
<script lang="ts">
	import { getTokenTaxInformation } from '$lib/helpers/tokentax';
	import { formatSwapFee } from '$lib/helpers/formatters';
	import { AlertList, Button, EntitySymbol, PageHeader } from '$lib/components';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import InfoTable from './InfoTable.svelte';
	import InfoSummary from './InfoSummary.svelte';
	import ChartSection from './ChartSection.svelte';
	import TimePeriodSummaryTable from './TimePeriodSummaryTable.svelte';
	import { page } from '$app/stores';

	export let data;

	$: summary = data.pair.summary;
	$: details = data.pair.additional_details;

	$: tokenTax = getTokenTaxInformation(details);
	$: isUniswapV3 = summary.exchange_type === 'uniswap_v3';
	$: isUniswapIncompatible = summary.exchange_type === 'uniswap_v2_incompatible';
	$: swapFee = formatSwapFee(summary.pair_swap_fee);

	// Ridiculous token price warning: it is common with scam tokens to price the
	// token super low so that prices are not readable when converted to USD.
	$: ridiculousPrice = summary.usd_price_latest < 0.000001;

	$: breadcrumbs = {
		[summary.chain_slug]: summary.chain_name,
		[summary.exchange_slug]: summary.exchange_name,
		[summary.pair_slug]: summary.pair_name
	};
</script>

<svelte:head>
	<title>
		{summary.pair_symbol} ({swapFee}) token price on {details.exchange_name}
	</title>
	<meta
		name="description"
		content="Price and liquidity for {summary.pair_symbol} on {details.exchange_name} on {details.chain_name}"
	/>
</svelte:head>

<Breadcrumbs labels={breadcrumbs} />

<main class="ds-3">
	<PageHeader>
		<span slot="title">
			{summary.pair_symbol}
			<span class="swap-fee">{swapFee}</span>
		</span>
		<span slot="subtitle" class="subtitle">
			token pair on {details.exchange_name} on
			<EntitySymbol type="blockchain" slug={summary.chain_slug} label={summary.chain_name} size="0.875em" />
		</span>
		<svelte:fragment slot="cta">
			{#if details.trade_link}
				<Button href={details.trade_link} target="_blank" rel="noreferrer">
					Swap {summary.base_token_symbol_friendly}/{summary.quote_token_symbol_friendly}
				</Button>
			{/if}
		</svelte:fragment>
	</PageHeader>

	<section class="ds-container info" data-testid="pair-info">
		<div class="ds-2-col">
			<InfoTable {summary} {details} />
			<InfoSummary {summary} {details} pageUrl={$page.url.toString()} />
		</div>

		{#if isUniswapIncompatible || tokenTax.broken || ridiculousPrice}
			<AlertList status="warning" let:AlertItem>
				{#if isUniswapIncompatible}
					<AlertItem title="Incompatible exchange">
						{summary.exchange_name} is not fully compatible with Uniswap v2 protocols. Price, volume and liquidity data for
						{summary.pair_symbol} may be inaccurate.
					</AlertItem>
				{/if}

				{#if tokenTax.broken}
					<AlertItem>
						This token is unlikely to be tradeable.
						<a
							href="https://tradingstrategy.ai/docs/programming/market-data/token-tax.html#honeypots-and-other-rug-pull-risks"
							rel="external">Read more about transfer fees being broken or malicious in the token tax documentation</a
						>. Error code <strong>{tokenTax.sellTax}</strong>.
					</AlertItem>
				{/if}

				{#if ridiculousPrice}
					<AlertItem>
						This trading pair is using low digit price units that may prevent displaying the price data properly.
					</AlertItem>
				{/if}
			</AlertList>
		{/if}
	</section>

	<section class="ds-container charts">
		<ChartSection
			pairId={summary.pair_id}
			pairSymbol={summary.pair_symbol}
			exchangeType={summary.exchange_type}
			hasTvlData={Number.isFinite(summary.pair_tvl)}
			firstTradeDate={details.first_trade_at}
		/>
	</section>

	<section class="ds-container time-period-summary">
		<header>
			<h2>Time period summary</h2>
			<p>
				The price {isUniswapV3 ? 'and volume' : 'and liquidity'} of {summary.base_token_symbol_friendly} in this trading
				pair. The amounts are converted to US dollar through {summary.quote_token_symbol_friendly}/USD.
			</p>
		</header>

		<TimePeriodSummaryTable pairId={summary.pair_id} hideLiquidityAndTrades={isUniswapV3} />
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

	.subtitle {
		display: flex;
		align-items: center;
		gap: 0.5ex;
	}

	.swap-fee {
		margin-left: var(--space-xxs);
		color: var(--c-text-extra-light);
	}

	.info {
		gap: var(--space-3xl);

		@media (--viewport-lg-up) {
			gap: var(--space-6xl);
		}

		.ds-2-col {
			row-gap: var(--space-xl);
			align-items: start;
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

		header {
			display: grid;
			gap: var(--space-sl);
		}

		h2 {
			font: var(--f-h1-medium);
		}

		p {
			font: var(--f-h4-roman);
		}
	}
</style>
