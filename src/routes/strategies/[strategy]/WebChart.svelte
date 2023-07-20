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
	import { fromUnixTime } from 'date-fns';
	import { newPlot } from 'plotly.js-finance-dist';
	import type { Data, HoverLabel, Layout, LayoutAxis, PlotData, PlotType } from 'plotly.js';
	import type { WebChartData } from './chart';

	//
	// Chart styling props
	//
	export let name: string;
	export let description: string = ''; // Few words about us
	export let webChart: WebChartData; // Incoming data
	export let yType: 'dollar' | 'percent' = 'dollar';
	export let yAxisTitle = yType === 'dollar' ? 'US Dollar' : 'Percent';
	export let xAxisTitle = 'Date';
	export let yRangeMode: LayoutAxis['rangemode'] = 'tozero';
	export let charType: PlotType = 'scatter'; // See possible types https://plotly.com/javascript/
	export let barWidth = 24 * 3600 * 1000; // Bar chart bar width in seconds
	export let fillMode: PlotData['fill'] = 'tozeroy'; // Fill mode for line charts. Set to "none" to disable.

	// Svelte action to construct Plotly series data and layout objects, then fill
	// the action's node with the interactive SVG output from Plotly.js newPlot()
	function drawChart(node: HTMLDivElement, data: WebChartData['data']) {
		// Convert UNIX timestamp index to Dates
		const x = data.map(([ts]) => fromUnixTime(ts));
		// Convert values based on yType
		const y = data.map(([_, value]) => (yType === 'percent' ? value * 100 : value));

		// Get theme colors and other styles from computed CSS style
		const style = getComputedStyle(node);
		const font = {
			color: style.color,
			family: style.fontFamily
		};
		const background = style.background;
		const hoverBackground = style.getPropertyValue('--c-background-2');
		const hoverBorder = style.getPropertyValue('--c-background-3');
		// See CSS below: override default lineColor by setting `--chart-line-color` CSS variable
		const lineColor = style.getPropertyValue('--c-stroke');
		const gridcolor = style.getPropertyValue('--c-background-4');

		const plotData: Data = { x, y, type: charType };

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
			title: {
				text: `<b>${xAxisTitle}</b>`,
				font
			},
			tickfont: font,
			gridcolor
		};

		const yaxis: Partial<LayoutAxis> = {
			title: {
				text: `<b>${yAxisTitle}</b>`,
				standoff: 20,
				font
			},
			rangemode: yRangeMode,
			tickfont: font,
			tickformat: '.2f',
			gridcolor,
			automargin: true
		};

		if (yType == 'percent') {
			yaxis['ticksuffix'] = '%';
		}

		const hoverlabel: Partial<HoverLabel> = {
			bgcolor: hoverBackground,
			bordercolor: hoverBorder,
			font: { ...font, size: 16 }
		};

		const layout: Partial<Layout> = {
			xaxis,
			yaxis,
			margin: { l: 50, t: 0, pad: 4 },
			hoverlabel,
			paper_bgcolor: background,
			plot_bgcolor: background
		};

		newPlot(node, [plotData], layout);
	}
</script>

<div class="web-chart">
	<header>
		<h2 class="heading-chart">{name}</h2>
		{#if webChart?.help_link}
			<p>
				{description}
				Learn about
				<a class="body-link" href={webChart?.help_link}>
					{name}
				</a> metric and how it is calculated.
			</p>
		{/if}
	</header>

	<div class="plotly" use:drawChart={webChart.data} />
</div>

<style lang="postcss">
	.web-chart {
		/* override default line color */
		--c-stroke: var(--chart-line-color, hsl(var(--hsl-bullish)));

		margin: var(--space-lg) 0;
	}

	.heading-chart {
		font: var(--f-heading-xl-medium);
		letter-spacing: var(--f-heading-xl-spacing, normal);
		margin-bottom: var(--space-md);
	}

	.plotly {
		margin-top: var(--space-lg);
	}
</style>
