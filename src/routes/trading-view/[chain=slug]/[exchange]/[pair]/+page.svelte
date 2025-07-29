<!--
Render the pair trading page
- Core pair data loaded during SSR (see +page.ts)
- Detailed candle data is delayed until client-side (though the first run could be done in SSR)
- Selected time bucket (for charts) is carried over in URL fragment; this could
  be moved to SvelteKit routing query parameter
-->
<script lang="ts">
	import { page } from '$app/state';
	import { replaceState } from '$app/navigation';
	import { captureException } from '@sentry/sveltekit';
	import Alert from '$lib/components/Alert.svelte';
	import AlertList from '$lib/components/AlertList.svelte';
	import Button from '$lib/components/Button.svelte';
	import EntitySymbol from '$lib/components/EntitySymbol.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import InfoTable from './InfoTable.svelte';
	import InfoSummary from './InfoSummary.svelte';
	import PairCandleChart from '$lib/charts/PairCandleChart.svelte';
	import TimePeriodSummaryTable from './TimePeriodSummaryTable.svelte';
	import { getTokenTaxInformation } from '$lib/helpers/tokentax';
	import { formatSwapFee } from '$lib/helpers/formatters';
	import { getLogoUrl } from '$lib/helpers/assets';
	import { timeBucketEnum } from '$lib/schemas/utility';
	import { OptionGroup } from '$lib/helpers/option-group.svelte';

	let { data } = $props();
	let { summary, details } = $derived(data);

	let tokenTax = $derived(getTokenTaxInformation(details));
	let isUniswapV3 = $derived(summary.exchange_type === 'uniswap_v3');
	let isUniswapIncompatible = $derived(summary.exchange_type === 'uniswap_v2_incompatible');
	let swapFee = $derived(formatSwapFee(summary.pair_swap_fee));

	// Ridiculous token price warning: it is common with scam tokens to price the
	// token super low so that prices are not readable when converted to USD.
	let ridiculousPrice = $derived(summary.usd_price_latest < 0.000001);

	let breadcrumbs = $derived({
		[summary.chain_slug]: summary.chain_name,
		[summary.exchange_slug]: summary.exchange_name,
		[summary.pair_slug]: summary.pair_name
	});

	let timeBucket = new OptionGroup(timeBucketEnum.options, page.state.timeBucket ?? data.timeBucket);

	function handleTimeBucketChange({ detail: { name, value } }: CustomEvent) {
		if (name !== 'timeBucket') return;
		replaceState(`?${new URLSearchParams({ timeBucket: value })}`, { timeBucket: value });
	}
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
		{#snippet title()}
			<span>
				{summary.pair_symbol}
				<span class="swap-fee">{swapFee}</span>
			</span>
		{/snippet}
		{#snippet subtitle()}
			<span class="subtitle">
				token pair on {details.exchange_name} on
				<EntitySymbol
					size="0.875em"
					label={summary.chain_name}
					logoUrl={getLogoUrl('blockchain', summary.chain_slug)}
				/>
			</span>
		{/snippet}
		{#snippet cta()}
			{#if details.trade_link}
				<Button href={details.trade_link} target="_blank" rel="noreferrer">
					Swap {summary.base_token_symbol_friendly}/{summary.quote_token_symbol_friendly}
				</Button>
			{/if}
		{/snippet}
	</PageHeader>

	<section class="ds-container info" data-testid="pair-info">
		<div class="ds-2-col">
			<InfoTable {summary} {details} />
			<InfoSummary {summary} {details} pageUrl={page.url.toString()} />
		</div>

		{#if isUniswapIncompatible || tokenTax.broken || ridiculousPrice}
			<AlertList status="warning">
				{#snippet children({ AlertItem })}
					<AlertItem title="Incompatible exchange" displayWhen={isUniswapIncompatible}>
						{summary.exchange_name} is not fully compatible with Uniswap v2 protocols. Price, volume and liquidity data for
						{summary.pair_symbol} may be inaccurate.
					</AlertItem>

					<AlertItem displayWhen={tokenTax.broken}>
						This token is unlikely to be tradeable.
						<a
							href="https://tradingstrategy.ai/docs/programming/market-data/token-tax.html#honeypots-and-other-rug-pull-risks"
							rel="external">Read more about transfer fees being broken or malicious in the token tax documentation</a
						>. Error code <strong>{tokenTax.sellTax}</strong>.
					</AlertItem>

					<AlertItem displayWhen={ridiculousPrice}>
						This trading pair is using low digit price units that may prevent displaying the price data properly.
					</AlertItem>
				{/snippet}
			</AlertList>
		{/if}
	</section>

	<section class="ds-container charts">
		<svelte:boundary onerror={(e) => captureException(e)}>
			<PairCandleChart
				chainSlug={summary.chain_slug}
				exchangeType={summary.exchange_type}
				pairId={summary.pair_id}
				pairSymbol={summary.pair_symbol}
				{timeBucket}
				on:change={handleTimeBucketChange}
			/>

			{#snippet failed(error)}
				<Alert status="error" title="Render error">
					{error}
				</Alert>
			{/snippet}
		</svelte:boundary>
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

<style>
	main {
		display: grid;
		gap: var(--space-3xl);

		@media (--viewport-lg-up) {
			gap: 5rem;
		}
	}

	.subtitle {
		display: flex;
		flex-wrap: wrap;
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
		/* TODO: remove when TV chart migration is complete */
		:global([data-css-props]) {
			@media (--viewport-xs) {
				--button-padding: 0.375rem 0.75rem;
				--button-font: var(--f-ui-sm-medium);
				--button-letter-spacing: var(--f-ui-sm-spacing);
			}
		}

		/* prevent chart-flicker bug when scrollbars are enabled */
		overflow: visible;
	}

	.time-period-summary {
		display: grid;
		gap: 1.5rem;

		@media (--viewport-md-up) {
			gap: 2.25rem;
		}

		header {
			display: grid;
			gap: 0.5rem;
		}

		h2 {
			font: var(--f-h2-medium);
		}

		p {
			font: var(--f-ui-lg-roman);
			letter-spacing: var(--ls-ui-lg, normal);

			@media (--viewport-lg-up) {
				font: var(--f-ui-xl-roman);
				letter-spacing: var(--ls-ui-xl, normal);
			}
		}
	}
</style>
