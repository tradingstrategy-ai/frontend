<!--
@component

Render various charts from web_chart API endpoint
- X-axis: time
- Y-axis: US dollar or percent

Cannot be used with SSR.

For Plotly inputs see

- https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/plotly.js/index.d.ts

For line chart options see

- https://plotly.com/javascript/line-charts/
-->
<script lang="ts">
	import { newPlot } from 'plotly.js-finance-dist';
	import type { Data, Layout, LayoutAxis, PlotData } from 'plotly.js';
	import type { WebChartData } from './chart';
	import { onMount } from 'svelte';
	import { readCSSThemeVars } from '$lib/helpers/themes';

	//
	// Chart styling props
	//
	export let name: string;
	export let description; // Few words about us
	export let webChart: WebChartData; // Incoming data
	export let xAxisTitle = 'Date';
	export let yAxisTitle = 'US Dollar';
	export let yRangeMode = 'tozero';
	export let yType = 'dollar'; // "dollar" or "percent" for now
	export let fontFamily = 'Neue Haas Grotesk Text';
	//export let fontFamily = "Arial Extra Bold";
	export let charType: string = 'scatter'; // See possible types https://plotly.com/javascript/
	export let lineColorName = '--hsl-bullish'; // CSS var name for the line chart line colour
	export let barWidth = 24 * 3600 * 1000; // Bar chart bar width in seconds
	export let fillMode = 'tozeroy'; // Fill mode for line charts. Set null to disable.

	// Read in onMount()
	export let cssVars: Map<string, string>;

	// Bound for Plotly.js
	export let elem;

	// TODO: move reading these vars to a store?
	onMount(() => {
		cssVars = readCSSThemeVars();
	});

	$: {
		//
		// When we have data and theme available,
		// construct Plotly series data and layout objects.
		// Then fill the resulting element with the interactive SVG output
		// from Plotly.js newPlot()
		//

		if (!elem) {
			console.log('elem not yet available');
		} else {
			if (webChart.data && cssVars) {
				console.log('Rendering with plotly', webChart.data.length, 'entries');

				// Convert UNIX timestamp index to Dates
				const x = webChart.data.map((tuple) => {
					return new Date(tuple[0] * 1000);
				});
				let y;

				if (yType == 'dollar') {
					y = webChart.data.map((tuple) => {
						return tuple[1];
					});
				} else if (yType == 'percent') {
					y = webChart.data.map((tuple) => {
						return tuple[1] * 100;
					});
				} else {
					throw new Error('Not implemented');
				}

				const color = `hsl(${cssVars.get('--hsl-text')})`;
				const family = fontFamily; // TODO: Unconfirmed if SVG actually sets the font correctly
				const background = `hsl(${cssVars.get('--hsl-body')})`;
				const lineColor = `hsl(${cssVars.get(lineColorName)})`;
				const gridcolor = `hsl(${cssVars.get('--c-background-4')})`;

				const plotData: Partial<Data> = {
					x,
					y,
					type: charType
				};

				// Set bar widths to one day
				if (charType == 'bar') {
					plotData['width'] = barWidth;
				}

				// Style line charts
				if (charType == 'scatter') {
					plotData['line'] = {
						color: lineColor,
						width: 2
					};

					if (fillMode) {
						plotData['fill'] = fillMode;
					}
				}

				const xaxis: Partial<LayoutAxis> = {
					title: `<b>${xAxisTitle}</b>`,
					titlefont: {
						family,
						color
					},
					tickfont: {
						family,
						color
					},
					gridcolor
				};

				const yaxis: Partial<LayoutAxis> = {
					title: {
						text: `<b>${yAxisTitle}</b>`,
						standoff: 20
					},
					titlefont: {
						family,
						color
					},
					rangemode: yRangeMode,
					tickfont: {
						family,
						color
					},
					tickformat: '.2f',
					gridcolor,
					automargin: true
				};

				if (yType == 'percent') {
					yaxis['ticksuffix'] = '%';
				}

				// TODO: Style tooltips

				const layout: Partial<Layout> = {
					xaxis,
					yaxis,
					margin: {
						l: 50,
						t: 0,
						pad: 4
					},
					paper_bgcolor: background,
					plot_bgcolor: background
				};

				console.log('Rendering Plotly chart', layout);

				let Plot = newPlot(elem, [plotData], layout);
			} else {
				console.log('WebChartData data missing', webChart);
			}
		}
	}
</script>

<div class="web-chart">
	<header>
		<h2 class="heading-chart">{name}</h2>
		{#if webChart?.help_link}
			<p>
				{#if description}
					{description}
				{/if}
				Learn about
				<a class="help-link" href={webChart?.help_link}>
					{name}
				</a> metric and how it is calculated.
			</p>
		{/if}
	</header>

	<div class="plotly" bind:this={elem} />
</div>

<style lang="postcss">
	.web-chart {
		margin: var(--space-lg) 0;
	}

	.heading-chart {
		font: var(--f-heading-xl-medium);
		letter-spacing: var(--f-heading-l-spacing, normal);
		margin-bottom: var(--space-md);
	}

	.help-link {
		text-decoration: underline;
	}

	.plotly {
		margin-top: var(--space-lg);
	}
</style>
