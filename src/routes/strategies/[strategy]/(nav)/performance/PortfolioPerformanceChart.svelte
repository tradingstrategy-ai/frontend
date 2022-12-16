<!--
@component
Render the portfolio performance chart using Plotly.

- X-axis: time
- Y-axis: portfolio value

SSR needs to be disabled - Plotly.js does not work in SSR.

-->
<script lang="ts">
	// https://www.npmjs.com/package/plotly.js-finance-dist
	import Plotly from 'plotly.js-finance-dist';
	import type { TimeSeries } from './interface';
	import { SummaryBox } from '$lib/components';

	type Nullable<Type> = Type | null;

	// Input data
	export let graph: Nullable<TimeSeries>;

	// Passed to Plotly renderer
	let elem: Nullable<HTMLElement>;

	function updateChart(node: Nullable<HTMLElement>, graph: Nullable<TimeSeries>) {
		if (!node || !graph) {
			return;
		}

		// See
		// https://plotly.com/javascript/time-series/
		// https://plotly.com/javascript/axes/
		const data = [
			{
				x: graph.x,
				y: graph.y,
				type: 'scatter'
			}
		];

		const layout = {
			yaxis: {
				title: graph.yLabel
			}
		};

		if (graph.yRangeMode) {
			layout.yaxis.rangemode = graph.yRangeMode;
		}

		const config = { responsive: true };

		Plotly.newPlot(elem, data, layout, config);
	}

	$: updateChart(elem, graph);
</script>

{#if graph}
	<SummaryBox
		class="portfolio-performance-chart"
		title="Total equity"
		subtitle="Cash and market valued tokens in the strategy"
	>
		<div bind:this={elem} class="chart" />
	</SummaryBox>
{/if}

<style>
	.chart {
		width: 100%;
		overflow-x: auto;
		height: 400px;
	}
</style>
