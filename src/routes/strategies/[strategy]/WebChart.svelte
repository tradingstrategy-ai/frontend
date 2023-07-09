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
	import type {Data, PlotData} from "plotly.js";
	import type {WebChartData} from "./chart";

	export let elem;
	export let name: string;
	export let webChart: WebChartData;

	// See possible types
	// https://plotly.com/javascript/
	export let charType: string = "scatter";

	$: {

		if(!elem) {
			console.log("elem not yet available");
		} else {
			if(webChart.data) {
				console.log("Rendering with plotly", webChart.data.length, "entries");

				const headerText = 'On Mount Called !';
				// Convert UNIX timestamp index to Dates
				const x = webChart.data.map((tuple) => { return new Date(tuple[0] * 1000) });
				const y = webChart.data.map((tuple) => { return tuple[1] });

				console.log(x);
				console.log(y);

				const plotData: Data  = {
					x,
					y,
					type: charType,
				  };

				/*
				const data: PlotData = {
					x: ['giraffes', 'orangutans', 'monkeys'],
					y: [20, 14, 23],
					type: 'bar'
				  }*/

				let Plot = newPlot(elem, [plotData], {}, {showSendToCloud:true});
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
				</a>.
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
