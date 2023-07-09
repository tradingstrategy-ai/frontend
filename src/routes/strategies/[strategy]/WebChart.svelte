<!--
@component

Render various charts from web_chart API endpoint
- X-axis: time
- Y-axis: US dollar or percent

Cannot be used with SSR.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import Plotly from 'plotly.js-finance-dist';


	export let elem;
	export let name: string;
	export let webChart: WebChart;

	$: {

		if(!elem) {
			console.log("elem not yet available");
		} else {
			console.log("Rendering with plotly");

			const headerText = 'On Mount Called !';
			const data: Plotly.BarData[] = [
			  {
				x: ['giraffes', 'orangutans', 'monkeys'],
				y: [20, 14, 23],
				type: 'bar'
			  }
			];
			let Plot = new Plotly.newPlot(elem, data, {}, {showSendToCloud:true});
		}
	}


</script>

<div class="web-chart">

	<header>
		<h2>{name}</h2>
		<p>
			<a href={webChart?.help_link}>
				Learn more about {name}
			</a>
		</p>
	</header>

	{JSON.stringify(webChart?.data)}

	<div class="plotly" bind:this={elem}></div>

</div>

<style lang="postcss">

</style>
