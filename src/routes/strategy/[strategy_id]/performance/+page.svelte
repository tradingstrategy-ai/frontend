<!--

    Page to display the strategy performance.

-->
<script lang="ts">
	import type { PageData } from './$types';
	import { currentStrategy } from 'trade-executor-frontend/state/store';
	import type { TimeSeries } from './interface';
	import type { State } from 'trade-executor-frontend/state/interface';
	import PortfolioPerformance from './PortfolioPerformanceChart.svelte';
	import { getPortfolioLatestStats } from 'trade-executor-frontend/state/stats';
	import SummaryStatistics from './SummaryStatistics.svelte';

	export let data: PageData;

	// The whole strategy state
	$: performanceGraph = processPerformanceData($currentStrategy.state);

	$: latestStats = getPortfolioLatestStats($currentStrategy.state);

	/**
	 * Read the portfolio performance from persistante state and its stats part.
	 *
	 * Mangle the input suitable for our Plotly.js widget.
	 *
	 * @param state
	 */
	function processPerformanceData(state: State): TimeSeries | null {
		// During the strategy initialisation,
		// data may not be available
		if (!state || !state.stats || !state.stats.portfolio) {
			return null;
		}

		let x = [];
		let y = [];

		// Convert internal stats to Plotly.js format
		// TODO: See statistics.py for type definition
		for (let s: any of state.stats.portfolio) {
			const ts = new Date(s.calculated_at * 1000);
			const val = s.total_equity;
			x.push(ts);
			y.push(val);
		}

		console.log('Performance graph contains', x.length, 'data points');

		return { x, y, yLabel: 'Portfolio Value USD', yRangeMode: 'tozero' };
	}
</script>

<p>The current performance of the strategy.</p>

{#if performanceGraph}
	<h2>Total equity</h2>
	<p>Cash and market valued tokens in the strategy.</p>
	<PortfolioPerformance graph={performanceGraph} />
{/if}

<h2>Performance summary</h2>

<SummaryStatistics {latestStats} />
