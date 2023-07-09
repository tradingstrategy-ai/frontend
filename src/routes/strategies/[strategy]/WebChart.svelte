<!--
@component

Render various charts from web_chart API endpoint
- X-axis: time
- Y-axis: US dollar or percent

Cannot be used with SSR.

For Plotly inputs see

- https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/plotly.js/index.d.ts
-->
<script lang="ts">
	import {newPlot} from 'plotly.js-finance-dist';
	import type {Data, LayoutAxis, PlotData} from "plotly.js";
	import type {WebChartData} from "./chart";

	export let elem;
	export let name: string;
	export let webChart: WebChartData;
	export let xAxisTitle = "Date";
	export let yAxisTitle = "US Dollar";
	export let yRangeMode = "tozero";
	export let fontFamily = "Neue Haas Grotesk Text";

	// See possible types
	// https://plotly.com/javascript/
	export let charType: string = "scatter";

	$: {

		if(!elem) {
			console.log("elem not yet available");
		} else {
			if(webChart.data) {
				console.log("Rendering with plotly", webChart.data.length, "entries");

				// Convert UNIX timestamp index to Dates
				const x = webChart.data.map((tuple) => { return new Date(tuple[0] * 1000) });
				const y = webChart.data.map((tuple) => { return tuple[1] });

				const plotData: Data  = {
					x,
					y,
					type: charType,
				  };

				const xaxis: LayoutAxis = {
					title: xAxisTitle,
					font: {
						"family": fontFamily,
					},
					tickfont: {
						"family": fontFamily,
					}

				};

				const yaxis: LayoutAxis = {
					title: xAxisTitle,
					font: {
						"family": fontFamily,
					},
					rangemode: yRangeMode,
					tickfont: {
						"family": fontFamily,
					}
				};

				const layout = {
					xaxis,
					yaxis,
					 margin: {
						l: 50,
						pad: 4
					  }
				}

				let Plot = newPlot(elem, [plotData], layout);
			} else {
				console.log("WebChartData data missing", webChart);
			}
		}
	}


</script>

<div class="web-chart">

	<header>
		<h2>{name}</h2>
		{#if webChart?.help_link}
			<p>
				Learn about
				<a class="help-link" href={webChart?.help_link}>
					{name}
				</a> metric and how it is calculated.
			</p>
		{/if}
	</header>

	<div class="plotly" bind:this={elem}></div>

</div>

<style lang="postcss">

	h2 {
		font: var(--f-heading-xl-medium);
		letter-spacing: var(--f-heading-l-spacing, normal);
		margin-bottom: var(--space-md);
	}

	.help-link {
		text-decoration: underline;
	}
</style>
