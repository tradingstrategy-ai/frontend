<!--
	Page to display the strategy performance.
-->
<script lang="ts">
	import { getPortfolioLatestStats } from 'trade-executor/state/stats';
	import SummaryStatistics from './SummaryStatistics.svelte';
	import PortfolioPerformanceChart from './PortfolioPerformanceChart.svelte';

	export let data;
	$: ({ state, summary, profitabilityChart } = data);

	// Old path - read stats from the state
	$: oldLatestStats = getPortfolioLatestStats(state);
	// New path - use server precalculated stats
	$: summaryStatistics = summary?.summary_statistics;
</script>

<section class="performance">
	{#if profitabilityChart}
		<PortfolioPerformanceChart data={profitabilityChart.data} helpLink={profitabilityChart.help_link} />
	{/if}

	<SummaryStatistics {oldLatestStats} {summaryStatistics} />
</section>

<style>
	.performance {
		display: grid;
		gap: var(--space-lg);
	}
</style>
