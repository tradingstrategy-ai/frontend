<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import MyDeposits from '$lib/wallet/MyDeposits.svelte';
	import SummaryMetrics from './SummaryMetrics.svelte';
	import StrategyPerformanceChart from './StrategyPerformanceChart.svelte';
	import { getMetricsWithAltCAGR } from 'trade-executor/helpers/metrics';
	import {
		getExchangeAccountUrl,
		getExchangeDisplayName,
		getExchangeProtocolFromTags
	} from 'trade-executor/helpers/exchange-account';

	let { data } = $props();
	let { chain, strategy, vault, admin, ipCountry } = $derived(data);

	let backtestLink = $derived(`/strategies/${strategy.id}/backtest`);

	let exchangeAccount = $derived.by(() => {
		const protocol = getExchangeProtocolFromTags(strategy.tags ?? []);
		if (!protocol) return undefined;
		const safeAddress =
			strategy.on_chain_data.asset_management_mode === 'lagoon'
				? strategy.on_chain_data.smart_contracts.safe
				: undefined;
		if (!safeAddress) return undefined;
		const url = getExchangeAccountUrl(protocol, safeAddress);
		if (!url) return undefined;
		return { url, name: getExchangeDisplayName(protocol), protocol };
	});

	// Temporary hack to address inaccurate CAGR metric (remove once this is fixed)
	let keyMetrics = $derived(getMetricsWithAltCAGR(strategy));
</script>

<svelte:head>
	<title>{strategy.name} | Trading Strategy</title>
	<meta name="description" content={strategy.short_description} />
</svelte:head>

<div class="strategy-overview-page">
	<div class="sidebar-stack">
		<MyDeposits {strategy} {chain} {vault} {ipCountry} {admin} />

		{#if exchangeAccount}
			<section class="exchange-account-box tile a">
				<h2>
					<img src="/avatars/{exchangeAccount.protocol}.svg" alt="{exchangeAccount.name} logo" />
					<span>{exchangeAccount.name} account</span>
				</h2>
				<p>This vault trades on {exchangeAccount.name}</p>
				<Button size="lg" href={exchangeAccount.url} target="_blank" rel="noreferrer">
					View strategy on {exchangeAccount.name}
				</Button>
			</section>
		{/if}
	</div>
	<StrategyPerformanceChart {strategy} />
	<SummaryMetrics {keyMetrics} {backtestLink} hideTimeframes={strategy.hiddenElements.timeframes} />
</div>

<style>
	.strategy-overview-page {
		display: grid;
		gap: 1rem;
		align-items: flex-start;

		.sidebar-stack {
			display: grid;
			gap: 1rem;
		}

		.exchange-account-box {
			display: grid;
			gap: 1rem;
			padding: 1.25rem;
			border: 1px solid var(--c-text-light);

			h2,
			p {
				margin: 0;
			}

			h2 {
				display: flex;
				gap: 0.75rem;
				align-items: center;
				font: var(--f-heading-sm-medium);

				img {
					width: 2rem;
					height: 2rem;
					border-radius: 999px;
					flex: 0 0 auto;
				}
			}

			p {
				color: var(--c-text-extra-light);
				font: var(--f-ui-md-medium);
				letter-spacing: var(--ls-ui-md);
			}

			:global(.button) {
				--button-width: 100%;
			}
		}

		/* Desktop 2 column layout */
		@media (--viewport-md-up) {
			gap: 1.5rem;
			grid-template-columns: 2fr minmax(17rem, 1fr);

			/* move sidebar widgets to row 2, col 2 */
			> :global(:nth-child(1)) {
				grid-area: 2 / 2;
			}

			/* chart spans full row width */
			> :global(:nth-child(2n)) {
				grid-column: 1 / -1;
			}
		}
	}
</style>
