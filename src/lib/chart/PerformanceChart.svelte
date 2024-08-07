<!--
@component
Display a peformance line chart for a given (static) dataset.

#### Usage:
```tsx
	<PerformanceChart
		loading={true|false}
		data={chartData}
		formatValue={formatDollar}
		spanDays={30}
		periodicity={ period: 1, interval: 1, timeUnit: 'day'}
		init={(chartEngine) => chartEngine.doStuff()}
	/>
```
-->
<script lang="ts">
	import { differenceInCalendarDays } from 'date-fns';
	import type { Quote, Periodicity } from '$lib/chart';
	import { ChartIQ, Marker } from '$lib/chart';
	import { Timestamp, UpDownCell } from '$lib/components';
	import { determinePriceChangeClass } from '$lib/helpers/price';
	import { merge } from '$lib/helpers/object';

	export let loading = false;
	export let data: Quote[] = [];
	export let options: any = undefined;
	export let formatValue: Formatter<MaybeNumber>;
	export let spanDays: MaybeNumber;
	export let periodicity: Periodicity;
	export let studies: any[] = [];
	export let dataSegmentChange: Function | undefined = undefined;

	let chartWrapper: HTMLElement;

	let viewportWidth: number;
	$: hideYAxis = viewportWidth <= 576;

	// if spanDays is not set, assume "max" (full data range)
	$: if (spanDays === undefined) {
		spanDays ??= differenceInCalendarDays(new Date(), data[0]?.DT) || 0;
		// override periodicity to weekly for time spans greater than 1 year
		if (spanDays > 365) {
			periodicity = { period: 7, interval: 1, timeUnit: 'day' };
		}
	}

	const defaultOptions = {
		layout: { chartType: 'mountain' },
		controls: { chartControls: null },
		dontRoll: true,

		chart: {
			tension: 0.5,
			xAxis: { displayGridLines: false },
			yAxis: {
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

			// call optional dataSegmentChange callback
			dataSegmentChange?.(first, last);
		});

		// returned callback invoked on both initial load and updates
		return () => {
			chartEngine.loadChart('Performance', {
				periodicity,
				masterData: data
			});

			chartEngine.setSpan({
				base: 'day',
				multiplier: spanDays,
				goIntoPast: true
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
	<ChartIQ
		{loading}
		{init}
		options={merge(defaultOptions, options)}
		{studies}
		invalidate={[periodicity, hideYAxis]}
		let:cursor
	>
		{@const { position, data } = cursor}
		{#if data}
			<Marker x={position.DateX} y={position.CloseY} size={4.5} />
			<div class="chart-hover-info" style:--x="{position.cx}px" style:--y="{position.CloseY}px">
				<UpDownCell value={data.Close - data.iqPrevClose}>
					<Timestamp date={data.adjustedDate} withTime={periodicity.timeUnit === 'hour'} />
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
				color: var(--c-text-extra-light);
			}

			.value {
				font: var(--f-ui-md-medium);
				letter-spacing: var(--f-ui-md-spacing);
			}
		}
	}
</style>
