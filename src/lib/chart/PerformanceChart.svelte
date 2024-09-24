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
	import type { Quote, Periodicity } from '$lib/chart';
	import { createEventDispatcher } from 'svelte';
	import { differenceInCalendarDays } from 'date-fns';
	import { ChartIQ, Marker } from '$lib/chart';
	import { Timestamp, UpDownCell } from '$lib/components';
	import { determinePriceChangeClass } from '$lib/helpers/price';
	import { merge } from '$lib/helpers/object';

	export let loading = false;
	export let data: Quote[] = [];
	export let options: any = undefined;
	export let formatValue: Formatter<MaybeNumber>;
	export let spanDays: MaybeNumber;
	export let studies: any[] = [];
	let initCallback: Function | undefined = undefined;
	export { initCallback as init };
	export let invalidate: any[] = [];

	const dispatch = createEventDispatcher<{
		change: {
			first: Maybe<Quote>;
			last: Maybe<Quote>;
			firstTickPosition: number;
		};
	}>();

	let chartWrapper: HTMLElement;

	let viewportWidth: number;
	$: hideYAxis = viewportWidth <= 576;

	// if spanDays is not set, assume "max" (full data range)
	$: if (spanDays === undefined) {
		const start = data[0]?.DT;
		spanDays = start ? differenceInCalendarDays(new Date(), start) : 0;
	}

	$: periodicity = getPeriodicity(spanDays!);

	function getPeriodicity(days: number): Periodicity {
		if (days <= 7) return { period: 1, interval: 1, timeUnit: 'hour' };
		if (days <= 30) return { period: 4, interval: 1, timeUnit: 'hour' };
		if (days <= 365) return { period: 1, interval: 1, timeUnit: 'day' };
		return { period: 7, interval: 1, timeUnit: 'day' };
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
			const last = chartEngine.getFirstLastDataRecord(dataSegment, 'Close', true);
			const direction = determinePriceChangeClass(last?.Close - first?.Close);
			const firstTickPosition = chartEngine.pixelFromTick(0);

			// NOTE: setting attribute selector on HTML element rather than declaratively via
			// Svelte template; needed to prevent race condition / ensure colors update correctly.
			if (chartWrapper.dataset.direction !== direction) {
				chartWrapper.dataset.direction = direction;
				chartEngine.clearStyles();
			}

			dispatch('change', { first, last, firstTickPosition });
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
				multiplier: spanDays,
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
