<!--
	Page to display the strategy performance.
-->
<script lang="ts">
	import type { PageData } from './$types';
	import type { TimeSeries } from './interface';
	import type { State } from 'trade-executor-frontend/state/interface';
	import PortfolioPerformance from './PortfolioPerformanceChart.svelte';
	import { getPortfolioLatestStats } from 'trade-executor-frontend/state/stats';
	import SummaryStatistics from './SummaryStatistics.svelte';
	import { fromUnixTime } from 'date-fns';

	export let data: PageData;

	$: performanceGraph = processPerformanceData(data.state);
	$: latestStats = getPortfolioLatestStats(data.state);

	/**
	 * Read the portfolio performance from persistante state and its stats part.
	 *
	 * Mangle the input suitable for our Plotly.js widget.
	 */
	function processPerformanceData(state: State): TimeSeries | null {
		// Data may not be available during the strategy initialisation
		const portfolio = state?.stats?.portfolio;
		if (!portfolio) {
			return null;
		}

		let x = [];
		let y = [];

		// Convert internal stats to Plotly.js format
		// TODO: See statistics.py for type definition
		for (let s of portfolio) {
			const ts = fromUnixTime(s.calculated_at);
			const val = s.total_equity;
			x.push(ts);
			y.push(val);
		}

		console.log('Performance graph contains', x.length, 'data points');

		return { x, y, yLabel: 'Portfolio Value USD', yRangeMode: 'tozero' };
	}
</script>

<section class="performance">
	<PortfolioPerformance graph={performanceGraph} />

	<SummaryStatistics {latestStats} />
</section>

<style>
	.performance {
		display: grid;
		gap: var(--space-xl);
	}
</style>
