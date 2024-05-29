<script lang="ts">
	import { determinePriceChangeClass } from '$lib/helpers/price';
	import { formatPercent } from '$lib/helpers/formatters';
	import { type Quote, ChartIQ, Marker, calculateYAxisRange } from '$lib/chart';
	import { UpDownCell, Timestamp } from '$lib/components';

	export let data: Quote[] = [];
	export let dateRange: [Date?, Date?];

	// used for setting yAxis zoom
	const [min, max] = calculateYAxisRange(data, 1, 0.12);

	const options = {
		layout: { chartType: 'mountain' },
		controls: { home: null },
		allowScroll: false,
		allowZoom: false,
		xaxisHeight: 0,

		chart: {
			tension: 1,
			xAxis: { noDraw: true },
			yAxis: { noDraw: true, min, max }
		}
	};

	function getProfitChangeClass() {
		const first = data[0]?.Value ?? 0;
		const last = data.at(-1)?.Value ?? 0;
		return determinePriceChangeClass(last - first);
	}

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

<figure class="chart-thumbnail ds-3 {getProfitChangeClass()}">
	<ChartIQ {init} {options} let:cursor>
		{@const { position, data } = cursor}
		{#if data}
			<Marker x={position.DateX} y={position.CloseY} size={4} />
			<div class="chart-hover-info" style:--x="{position.cx}px" style:--y="{position.CloseY}px">
				<UpDownCell value={data.Close - data.iqPrevClose}>
					<Timestamp date={data.adjustedDate} />
					<div class="value">{formatPercent(data.Close, 2)}</div>
				</UpDownCell>
			</div>
		{/if}
	</ChartIQ>
	<figcaption>Past 90 days historical performance</figcaption>
</figure>

<style lang="postcss">
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
			font: var(--f-ui-md-roman);
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

	.chart-hover-info {
		position: absolute;
		left: var(--x);
		top: var(--y);
		transform: translate(-50%, calc(-100% - var(--space-md)));

		:global(time) {
			color: var(--c-text-extra-light);
		}

		.value {
			font: var(--f-ui-md-medium);
		}
	}
</style>
