<!--
	Page to display the strategy performance.
-->
<script lang="ts">
	import { getPortfolioLatestStats } from 'trade-executor/state/stats';
	import SummaryStatistics from './SummaryStatistics.svelte';
	import WebChart from '../../WebChart.svelte';
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
		<!-- We cannot do fill here, because protability chart goes below zero -->
		<WebChart
			name="Profitability"
			description="Compounded profitability of realised trading positions."
			webChart={profitabilityChart}
			yType="percent"
			yAxisTitle="Realised profit"
			fillMode="none"
		/>

		<PortfolioPerformanceChart data={profitabilityChart.data} />
	{/if}

	<SummaryStatistics {oldLatestStats} {summaryStatistics} />
</section>

<style>
	.performance {
		display: grid;
		gap: var(--space-lg);
	}
</style>
