<!--
@component
Render the portfolio performance chart using ChartIQ.
- X-axis: time
- Y-axis: portfolio value
-->
<script lang="ts">
	import { SummaryBox } from '$lib/components';
	import ChartIQ from '$lib/chart/ChartIQ.svelte';

	export let name: string;
	export let portfolio;

	const options = {
		layout: {
			chartType: 'line',
			crosshair: true
		},
		controls: {
			chartControls: null
		}
	};

	function getChartData(portfolio) {
		if (!portfolio) return [];
		return portfolio.map((tick) => {
			return {
				DT: tick.calculated_at * 1000,
				Value: tick.total_equity
			};
		});
	}

	function init(chartEngine: any) {
		chartEngine.chart.yAxis.position = 'left';
		chartEngine.chart.yAxis.decimalPlaces = 2;
		chartEngine.chart.yAxis.maxDecimalPlaces = 2;

		return {
			update() {
				chartEngine.loadChart(name, {
					periodicity: { period: 24, interval: 1, timeUnit: 'hour' },
					span: { base: 'day', multiplier: 90 },
					masterData: getChartData(portfolio)
				});
			}
		};
	}
</script>

{#if portfolio}
	<SummaryBox title="Total equity" subtitle="Cash and market valued tokens in the strategy (USD)">
		<div class="portfolio-performance-chart">
			<ChartIQ {init} {options} />
		</div>
	</SummaryBox>
{/if}

<style>
	.portfolio-performance-chart {
		--chart-aspect-ratio: 2;

		@media (--viewport-sm-down) {
			--chart-aspect-ratio: 1.75;
		}

		@media (--viewport-xs) {
			--chart-aspect-ratio: 1.25;
		}
	}
</style>
