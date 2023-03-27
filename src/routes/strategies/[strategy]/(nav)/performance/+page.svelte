<!--
	Page to display the strategy performance.
-->
<script lang="ts">
	import type { PageData } from './$types';
	import PortfolioPerformanceChart from './PortfolioPerformanceChart.svelte';
	import { getPortfolioLatestStats } from 'trade-executor-frontend/state/stats';
	import SummaryStatistics from './SummaryStatistics.svelte';

	export let data: PageData;
	$: ({ state, summary } = data);

	$: portfolio = state?.stats?.portfolio;
	$: latestStats = getPortfolioLatestStats(state);
</script>

<section class="performance">
	{#if portfolio}
		<PortfolioPerformanceChart name={summary.name} {portfolio} />
	{/if}

	<SummaryStatistics {latestStats} />
</section>

<style>
	.performance {
		display: grid;
		gap: var(--space-lg);
	}
</style>
