<!--
	Page to display the strategy performance.
-->
<script lang="ts">
	import type { PageData } from './$types';
	import PortfolioPerformance from './PortfolioPerformanceChart.svelte';
	import { getPortfolioLatestStats } from 'trade-executor-frontend/state/stats';
	import SummaryStatistics from './SummaryStatistics.svelte';

	export let data: PageData;
	$: ({ state, summary } = data);

	$: latestStats = getPortfolioLatestStats(state);
</script>

<section class="performance">
	<PortfolioPerformance name={summary.name} portfolio={state?.stats?.portfolio} />

	<SummaryStatistics {latestStats} />
</section>

<style>
	.performance {
		display: grid;
		gap: var(--space-lg);
	}
</style>
