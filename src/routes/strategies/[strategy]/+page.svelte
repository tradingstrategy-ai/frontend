<script lang="ts">
	import MyDeposits from '$lib/wallet/MyDeposits.svelte';
	import SummaryMetrics from './SummaryMetrics.svelte';
	import StrategyPerformanceChart from './StrategyPerformanceChart.svelte';
	import { isGeoBlocked } from '$lib/helpers/geo';
	import { getMetricsWithAltCAGR } from 'trade-executor/helpers/metrics';

	let { data } = $props();
	let { chain, strategy, vault, admin, ipCountry } = $derived(data);

	let backtestLink = $derived(`/strategies/${strategy.id}/backtest`);

	// svelte-ignore state_referenced_locally
	const geoBlocked = !admin && isGeoBlocked('strategies:deposit', ipCountry);

	// Temporary hack to address inaccurate CAGR metric (remove once this is fixed)
	let keyMetrics = $derived(getMetricsWithAltCAGR(strategy));

	let depositsDisabled = $derived(strategy.tags?.includes('deposits_disabled'));
</script>

<svelte:head>
	<title>{strategy.name} | Trading Strategy</title>
	<meta name="description" content={strategy.short_description} />
</svelte:head>

<div class="strategy-overview-page">
	{#if !depositsDisabled || admin}
		<MyDeposits {strategy} {chain} {vault} {geoBlocked} {ipCountry} adminOnly={!!depositsDisabled && !!admin} />
	{/if}
	<StrategyPerformanceChart {strategy} />
	<SummaryMetrics {keyMetrics} {backtestLink} />
</div>

<style>
	.strategy-overview-page {
		display: grid;
		gap: 1rem;
		align-items: flex-start;

		/* Desktop 2 column layout */
		@media (--viewport-md-up) {
			gap: 1.5rem;
			grid-template-columns: 2fr minmax(17rem, 1fr);

			/* move deposit widget (1st element) to row 2, col 2 */
			> :global(:nth-child(1)) {
				grid-area: 2 / 2;
			}

			/* chart and description (2nd & 4th elements) span full row width */
			> :global(:nth-child(2n)) {
				grid-column: 1 / -1;
			}
		}
	}
</style>
