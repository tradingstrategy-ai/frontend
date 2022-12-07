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

	// Time series
	import type { TimeSeries } from './interface';

	// Input data
	export let graph: TimeSeries;

	// Passed to Plotly renderer
	let elem: HTMLElement | null = null;

	function updateChart(node: HTMLElement | null, graph: TimeSeries) {
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

		Plotly.newPlot(elem, data, layout);
	}

	$: updateChart(elem, graph);
</script>

<div bind:this={elem} class="chart" />

<style>
	.chart {
		width: 100%;
		height: 400px;
	}
</style>
