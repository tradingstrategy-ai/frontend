<!--
@component
Display a peformance line chart for a given (static) dataset.

@example

```svelte
	<PerformanceChart
		loading={true|false}
		data={chartData}
		formatValue={formatDollar}
		spanDays={30}
		init={(chartEngine) => chartEngine.doStuff()}
	/>
```
-->
<script lang="ts">
	import type { Quote } from '$lib/chart';
	import { differenceInCalendarDays } from 'date-fns';
	import { ChartIQ, Marker } from '$lib/chart';
	import { Timestamp, UpDownCell } from '$lib/components';
	import { determinePriceChangeClass } from '$lib/helpers/price';
	import { relativeProfitability } from 'trade-executor/helpers/profit';
	import { merge } from '$lib/helpers/object';

	type Props = {
		loading?: boolean;
		data?: Quote[];
		options?: object;
		formatValue: Formatter<MaybeNumber>;
		spanDays: MaybeNumber;
		studies?: any[];
		invalidate?: any[];
		init?: (arg: any) => () => void;
		onPeriodPerformanceChange?: (value: MaybeNumber) => void;
	};

	let {
		loading = false,
		data = [],
		options,
		formatValue,
		spanDays,
		studies = [],
		invalidate = [],
		init: initCallback,
		onPeriodPerformanceChange
	}: Props = $props();

	let chartWrapper: HTMLElement;

	let viewportWidth = $state() as number;
	let hideYAxis = $derived(viewportWidth <= 576);

	// set displayDays to spanDays if set; otherwise max data range
	let displayDays = $derived.by(() => {
		if (spanDays) return spanDays;
		const start = data[0]?.DT;
		return start ? differenceInCalendarDays(new Date(), start) : 0;
	});

	// dynamically set periodicity based on number of days displayed
	let periodicity = $derived.by(() => {
		if (displayDays <= 7) return { period: 1, interval: 1, timeUnit: 'hour' };
		if (displayDays <= 30) return { period: 4, interval: 1, timeUnit: 'hour' };
		if (displayDays <= 365) return { period: 1, interval: 1, timeUnit: 'day' };
		return { period: 7, interval: 1, timeUnit: 'day' };
	});

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
			const first = chartEngine.getFirstLastDataRecord(dataSegment, 'Value');
			const last = chartEngine.getFirstLastDataRecord(dataSegment, 'Value', true);
			const firstTickPosition = chartEngine.pixelFromTick(0);

			let initialValue = first?.Value;

			// if max timeframe OR first tick is after start of displayed chart window
			// use initial value of 0 instead of first quote value (since chart data does
			// not always start at 0)
			if (!spanDays || firstTickPosition > 0) {
				initialValue = 0;
			}

			const direction = determinePriceChangeClass(last?.Value - initialValue);
			const periodPerformance = relativeProfitability(initialValue, last?.Value);

			// NOTE: setting attribute selector on HTML element rather than declaratively via
			// Svelte template; needed to prevent race condition / ensure colors update correctly.
			if (chartWrapper.dataset.direction !== direction) {
				chartWrapper.dataset.direction = direction;
				chartEngine.clearStyles();
			}

			onPeriodPerformanceChange?.(periodPerformance);
		});

		const updateCallback = initCallback?.(chartEngine);

		// returned callback invoked on both initial load and updates
		return () => {
			chartEngine.loadChart('Performance', {
				periodicity,
				masterData: data
			});

			chartEngine.setSpan({
				base: 'day',
				multiplier: displayDays,
				goIntoPast: true
			});

			// hide the Y Axis on smaller screens
			Object.values(chartEngine.panels).forEach((panel: any) => {
				chartEngine.setYAxisPosition(panel.yAxis, hideYAxis ? 'none' : 'right');
			});

			updateCallback?.();
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
		invalidate={[data, periodicity, hideYAxis, ...invalidate]}
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

<style>
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
