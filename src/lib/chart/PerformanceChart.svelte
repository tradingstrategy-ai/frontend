<!--
@component
Display a peformance line chart for a given (static) dataset.

#### Usage:
```tsx
	<PerformanceChart
		data={chartData}
		formatValue={formatDollar}
		spanDays={30}
		periodicity={ period: 1, interval: 1, timeUnit: 'day'}
		init={(chartEngine) => chartEngine.doStuff()}
	/>
```
-->
<script lang="ts">
	import type { Quote, Periodicity } from '$lib/chart';
	import { ChartIQ, Marker } from '$lib/chart';
	import { Timestamp, UpDownCell } from '$lib/components';
	import { determinePriceChangeClass } from '$lib/helpers/price';

	export let data: Quote[];
	export let formatValue: Formatter<number>;
	export let spanDays: number;
	export let periodicity: Periodicity;
	export let studies: any[] = [];
	export let yAxis = false;

	let chartWrapper: HTMLElement;

	let viewportWidth: number;
	$: hideYAxis = viewportWidth <= 576;

	const options = {
		layout: { chartType: 'mountain' },
		controls: { chartControls: null },
		dontRoll: true,

		chart: {
			tension: 1,
			xAxis: { displayGridLines: false },
			yAxis: {
				noDraw: !yAxis,
				displayGridLines: false,
				priceFormatter: (...args: any[]) => formatValue(args[2], 0)
			}
		}
	};

	function init(chartEngine: any) {
		// update chart colors based on change in value (+/-) for visible data set
		chartEngine.append('createDataSegment', () => {
			const dataSegment = chartEngine.getDataSegment();
			const first = chartEngine.getFirstLastDataRecord(dataSegment, 'Close');
			const last = chartEngine.getFirstLastDataRecord(dataSegment, 'Close', 'last');
			const direction = determinePriceChangeClass(last?.Close - first?.Close);
			// NOTE: setting attribute selector on HTML element rather than declaratively via
			// Svelte template; needed to prevent race condition / ensure colors update correctly.
			if (chartWrapper.dataset.direction !== direction) {
				chartWrapper.dataset.direction = direction;
				chartEngine.clearStyles();
			}
		});

		// returned callback invoked on both initial load and updates
		return () => {
			chartEngine.loadChart('Performance', {
				periodicity,
				span: { base: 'day', multiplier: spanDays },
				masterData: data
			});

			// hide the Y Axis on smaller screens
			Object.values(chartEngine.panels).forEach((panel: any) => {
				chartEngine.setYAxisPosition(panel.yAxis, hideYAxis ? 'none' : 'right');
			});
		};
	}
</script>

<svelte:window bind:innerWidth={viewportWidth} />

<div class="performance-chart" bind:this={chartWrapper}>
	<ChartIQ {init} {options} {studies} invalidate={[periodicity, hideYAxis]} let:cursor>
		{@const { position, data } = cursor}
		{#if data}
			<Marker x={position.DateX} y={position.CloseY} size={4.5} />
			<div class="chart-hover-info" style:--x="{position.cx}px" style:--y="{position.CloseY}px">
				<UpDownCell value={data.Close - data.iqPrevClose}>
					<Timestamp date={data.adjustedDate} withTime={periodicity.timeUnit === 'minute'} />
					<div class="value">{formatValue(data.Close, 2)}</div>
				</UpDownCell>
			</div>
		{/if}
	</ChartIQ>
</div>

<style lang="postcss">
	.performance-chart {
		:global([data-css-props]) {
			--chart-aspect-ratio: 2;

			@media (--viewport-sm-down) {
				--chart-aspect-ratio: 1.75;
			}

			@media (--viewport-xs) {
				--chart-aspect-ratio: 1.25;
			}
		}

		.chart-hover-info {
			position: absolute;
			left: var(--x);
			top: var(--y);
			transform: translate(-50%, calc(-100% - var(--space-md)));

			:global(time) {
				color: hsl(var(--hsl-text-extra-light));
			}

			.value {
				font: var(--f-ui-md-medium);
				letter-spacing: var(--f-ui-md-spacing);
			}
		}
	}
</style>
