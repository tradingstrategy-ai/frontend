<script>
	import PageHeading from '$lib/components/PageHeading.svelte';
	import StrategyOverviewSummary from './StrategyOverviewSummary.svelte';
	import Tabs from '$lib/components/Tabs.svelte';

	const tabs = [
		{
			component: StrategyOverviewSummary,
			id: 'overview',
			title: 'Overview'
		},
		{
			component: null,
			id: 'open-positions',
			title: 'Open positions'
		}
	];
</script>

<main class="strategy-overview ds-container">
	<PageHeading
		title="<h1>QuickSwap momentum</h1>"
		subtitle="<p>This strategy is a test strategy that does not aim to generated profit. The strategy trades on MATIC/USDC pairs on QuickSwap. The strategy rebalances every 16 hours to generate maximum amount of data. Based on 4h candles, the strategy calculates the momentum and picks highest gainers. The portfolio can hold 6 positions at once.</p>"
	/>
	<Tabs {tabs} />
</main>

<style>
	:global(.page-heading p) {
		font: var(--f-ui-md-medium) !important;
	}
</style>
