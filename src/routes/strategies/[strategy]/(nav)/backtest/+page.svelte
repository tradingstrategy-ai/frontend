<!--
	Page to display the strategy backtest results.
-->
<script lang="ts">
	import PortfolioPerformanceChart from './PortfolioPerformanceChart.svelte';
	import { getPortfolioLatestStats } from 'trade-executor-frontend/state/stats';
	import SummaryStatistics from './SummaryStatistics.svelte';

	export let data;
	$: ({ state, summary } = data);

</script>

<section class="backtest">
</section>

<style>
	.performance {
		display: grid;
		gap: var(--space-lg);
	}
</style>
