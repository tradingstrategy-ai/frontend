<script lang="ts">
	import { relativeProfitability } from 'trade-executor/helpers/profit';
	import { getProfitInfo } from '$lib/components/Profitability.svelte';
	import { formatPercent } from '$lib/helpers/formatters';
	import { type Quote, ChartIQ, calculateYAxisRange } from '$lib/chart';
	import ChartTooltip from '$lib/chart/ChartTooltip.svelte';

	export let data: Quote[] = [];
	export let dateRange: [Date?, Date?];

	// used for setting yAxis zoom
	const [min, max] = calculateYAxisRange(data, 1, 0.12);

	// TODO: should be based on displayed data range rather than full range
	const relativeProfit = getProfitInfo(relativeProfitability(data[0]?.Value, data.at(-1)?.Value));

	const options = {
		layout: { chartType: 'mountain' },
		controls: { home: null },
		allowScroll: false,
		allowZoom: false,
		xaxisHeight: 0,

		chart: {
			tension: 0.5,
			xAxis: { noDraw: true },
			yAxis: { noDraw: true, min, max }
		}
	};

	function init(chartEngine: any) {
		// add thin baseline at y=0
		chartEngine.append('draw', () => {
			const y = chartEngine.pixelFromPrice(0, chartEngine.chart.panel);
			chartEngine.plotLine({
				x0: 0,
				x1: 1,
				y0: y,
				y1: y,
				color: 'gray',
				type: 'line',
				opacity: 0.25
			});
		});

		return () => {
			chartEngine.loadChart('strategy-thumbnail', {
				periodicity: { period: 1, timeUnit: 'day' },
				range: {
					dtLeft: dateRange[0],
					dtRight: dateRange[1],
					goIntoPast: true
				},
				masterData: data
			});

			// adjust xAxis pan (slighly off due to range setting)
			chartEngine.micropixels = 7.5;

			// re-draw
			chartEngine.draw();
		};
	}
</script>

<figure class="chart-thumbnail ds-3 {relativeProfit.directionClass}">
	<ChartIQ {init} {options} let:cursor>
		<ChartTooltip {cursor} formatValue={formatPercent} />
	</ChartIQ>
	<figcaption>Past 90 days historical performance</figcaption>
</figure>

<style>
	.chart-thumbnail {
		:global([data-css-props]) {
			--chart-height: 14rem;

			@media (--viewport-xs) {
				--chart-height: 11rem;
			}
		}

		position: relative;

		figcaption {
			position: absolute;
			bottom: 0;
			width: 100%;
			text-align: center;
			font: var(--f-ui-sm-medium);
			letter-spacing: var(--f-ui-md-spacing, normal);
			color: var(--c-text-extra-light);
			opacity: 0;
			transition: var(--transition-1);

			@media (--viewport-xs) {
				font: var(--f-ui-sm-roman);
				letter-spacing: var(--f-ui-sm-spacing, normal);
			}
		}
	}
</style>
