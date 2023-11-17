<!--
Render the pair trading page
- Core pair data loaded during SSR (see +page.ts)
- Detailed candle data is delayed until client-side (though the first run could be done in SSR)
- Selected time bucket (for charts) is carried over in URL fragment; this could
  be moved to SvelteKit routing query parameter
-->
<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { getTokenTaxInformation } from '$lib/helpers/tokentax';
	import { formatSwapFee } from '$lib/helpers/formatters';
	import { AlertList, Button, CopyWidget, PageHeader } from '$lib/components';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import InfoTable from './InfoTable.svelte';
	import InfoSummary from './InfoSummary.svelte';
	import ChartSection from './ChartSection.svelte';
	import TimePeriodSummaryTable from './TimePeriodSummaryTable.svelte';
	import { page } from '$app/stores';

	export let data;

	let copier: ComponentProps<CopyWidget>['copier'];

	$: summary = data.pair.summary;
	$: details = data.pair.additional_details;

	$: tokenTax = getTokenTaxInformation(details);
	$: isUniswapV3 = summary.exchange_type === 'uniswap_v3';
	$: isUniswapIncompatible = summary.exchange_type === 'uniswap_v2_incompatible';
	$: swapFee = formatSwapFee(summary.pool_swap_fee);

	// Ridiculous token price warning: it is common with scam tokens to price the
	// token super low so that prices are not readable when converted to USD.
	$: ridiculousPrice = summary.usd_price_latest < 0.000001;

	$: breadcrumbs = {
		[summary.chain_slug]: summary.chain_name,
		[summary.exchange_slug]: summary.exchange_name,
		[summary.pair_slug]: summary.pair_name
	};

	$: pageTitle = [
		summary.pair_symbol,
		isUniswapV3 ? `${swapFee} pool` : 'token price',
		`on ${details.exchange_name}`
	].join(' ');

	// Construct and copy identifier used in Python code (such as Jupyter notebooks); e.g.:
	// (ChainId.ethereum, "uniswap-v3", "WETH", "USDC", 0.0005) # Ether-USD Coin http://localhost:5173/trading-view/ethereum/uniswap-v3/eth-usdc-fee-5
	function copyPythonIdentifier(this: HTMLButtonElement) {
		const parts = [
			`ChainId.${summary.chain_slug}`,
			`"${summary.exchange_slug}"`,
			`"${summary.base_token_symbol}"`,
			`"${summary.quote_token_symbol}"`,
			summary.pool_swap_fee
		];
		const identifier = `(${parts.join(', ')}) # ${summary.pair_name} ${$page.url}`;
		copier?.copy(identifier);
		this.blur();
	}
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta
		name="description"
		content="Price and liquidity for {summary.pair_symbol} on {details.exchange_name} on {details.chain_name}"
	/>
</svelte:head>

<Breadcrumbs labels={breadcrumbs} />

<main>
	<PageHeader subtitle="token pair on {details.exchange_name} on {details.chain_name}">
		<span slot="title">
			{summary.pair_symbol}
			{#if isUniswapV3}
				<span class="pool-swap-fee">{swapFee}</span>
			{/if}
		</span>
	</PageHeader>

	<section class="ds-container info" data-testid="pair-info">
		<div class="ds-2-col">
			<InfoTable {summary} {details} />
			<InfoSummary {summary} {details} />
		</div>

		{#if isUniswapV3 || isUniswapIncompatible || tokenTax.broken || ridiculousPrice}
			<AlertList status="warning" let:AlertItem>
				{#if isUniswapV3}
					<AlertItem title="Uniswap V3 beta">
						We are in the process of integrating Uniswap V3 data. This page is available as a beta preview, but please
						note that the data for this trading pair is currently incomplete.
					</AlertItem>
				{/if}

				{#if isUniswapIncompatible}
					<AlertItem title="Incompatible exchange">
						{summary.exchange_name} is not fully compatible with Uniswap v2 protocols. Price, volume and liquidity data for
						{summary.pair_symbol}
						may be inaccurate.
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

		<div class="trade-actions">
			<Button label="Buy {summary.base_token_symbol_friendly}" href={details.buy_link} />
			<Button label="Sell {summary.base_token_symbol_friendly}" href={details.sell_link} />
			<Button label="Blockchain explorer" href={details.explorer_link} />
			<Button
				label="{summary.pair_symbol} API and historical data"
				href="./{summary.pair_slug}/api-and-historical-data"
			/>
			<Button label="Copy Python identifier" on:click={copyPythonIdentifier}>
				<CopyWidget slot="icon" bind:copier --icon-size="1rem" />
			</Button>
		</div>
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

	.pool-swap-fee {
		margin-left: var(--space-xxs);
		color: hsl(var(--hsl-text-extra-light));
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
