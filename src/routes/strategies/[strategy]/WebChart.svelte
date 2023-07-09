<!--
@component

Render various charts from web_chart API endpoint
- X-axis: time
- Y-axis: US dollar or percent

Cannot be used with SSR.
-->
<script lang="ts">

	import * as Plotly from 'plotly.js';

	export let elem;
	export let name: string;
	export let webChart: WebChart;

	$: {
		const data: Plotly.BarData[] = [
		  {
			x: ['giraffes', 'orangutans', 'monkeys'],
			y: [20, 14, 23],
			type: 'bar'
		  }
		];
		Plotly.newPlot(elem, data);
	}

</script>

<div class="web-chart">

	<header>
		<h2>{name}</h2>
		<p>
			<a href={webChart.help_link}>
				Learn more about {name}
			</a>
		</p>
	</header>

	{JSON.stringify(webChart.data)}

	<div class="plotly" bind:elem={this}></div>

</div>

<style lang="postcss">

</style>
