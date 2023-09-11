<script lang="ts">
	import { addUTCDays, floorUTCDate } from '$lib/helpers/date';
	import { determinePriceChangeClass } from '$lib/helpers/price';
	import { formatPercent } from '$lib/helpers/formatters';
	import { ChartIQ, Marker } from '$lib/chart';
	import { UpDownCell, Timestamp } from '$lib/components';

	type ChartTick = [Date, number | undefined];

	export let data: ChartTick[] = [];
	export let startDate: Date = addUTCDays(floorUTCDate(new Date()), -90);

	let chartWrapper: HTMLElement;

	const profitClass = determinePriceChangeClass(data.at(-1)?.[1]);

	const options = {
		layout: { chartType: 'mountain' },
		allowScroll: false,
		allowZoom: false,
		xaxisHeight: 0,

		chart: {
			tension: 1,
			xAxis: { noDraw: true },
			yAxis: { noDraw: true }
		}
	};

	function init(chartEngine: any) {
		chartEngine.addSeries('Baseline', {
			color: 'gray',
			opacity: 0.25,
			width: 1,
			shareYAxis: true
		});

		return {
			update() {
				chartEngine.loadChart('strategy-thumbnail', {
					masterData: data.map(([DT, Value]) => ({ DT, Value, Baseline: 0 })),
					range: { dtLeft: startDate, dtRight: data.at(-1)?.[0] }
				});

				const { yAxis } = chartEngine.chart;
				const domain = yAxis.high - yAxis.low;
				yAxis.zoom = (1 - domain) * 150;
				chartEngine.draw();
			}
		};
	}
</script>

<div bind:this={chartWrapper} class="chart-thumbnail ds-3 {profitClass}">
	<ChartIQ {init} {options} let:cursor>
		{@const { position, data } = cursor}
		{#if data}
			<Marker x={position.DateX} y={position.CloseY} size={4} />
			<div class="chart-hover-info" style:--x="{position.cx}px" style:--y="{position.CloseY}px">
				<UpDownCell value={data.Close - data.iqPrevClose}>
					<div class="date">
						<Timestamp date={data.DT} format="iso" />
					</div>
					<div class="value">{formatPercent(data.Close)}</div>
				</UpDownCell>
			</div>
		{/if}
	</ChartIQ>
</div>

<style lang="postcss">
	.chart-thumbnail {
		height: 14rem;

		@media (--viewport-xs) {
			height: 11rem;
		}

		& :global(.chart-container) {
			transform: scale(1.015, 1);
			width: 100%;
			height: 100%;
		}
	}

	.chart-hover-info {
		position: absolute;
		left: var(--x);
		top: var(--y);
		transform: translate(-50%, calc(-100% - var(--space-md)));

		& .date {
			font: var(--f-ui-sm-medium);
			color: hsla(var(--hsl-text-extra-light));
		}

		& .value {
			font: var(--f-ui-md-medium);
		}
	}
</style>
