<script lang="ts">
	import type { TimeInterval } from 'd3-time';
	import type { SeriesCallback } from './types';
	import { type LineSeriesPartialOptions, LineSeries } from 'lightweight-charts';
	import Series from './Series.svelte';
	import { dateToTs } from './helpers';

	type Props = {
		interval: TimeInterval;
		range: [Date, Date];
		color?: string;
		alwaysVisible?: boolean;
		setChartVisibleRange?: boolean;
	};

	// prettier-ignore
	let {
		interval,
		range,
		color = 'gray',
		alwaysVisible = false,
		setChartVisibleRange = false,
	}: Props = $props();

	// Synthesize baseline data (to display baseline and set chart date range)
	let data = $derived(
		interval.range(range[0], interval.offset(range[1])).map((d) => {
			return { time: dateToTs(d), value: 0 };
		})
	);

	const options: LineSeriesPartialOptions = {
		lineVisible: false,
		priceLineColor: color,
		crosshairMarkerVisible: false,
		lastValueVisible: false
	};

	let priceScaleCalculator = $derived(alwaysVisible ? undefined : () => null);

	// if setChartVisibleRange is enabled, set the visible range to the range start/end dates
	// must be `derived()` so a new callback is generated (and called) whenever the data changes
	const callback: SeriesCallback | undefined = $derived.by(() => {
		if (!setChartVisibleRange) return;
		const range = { from: data[0].time, to: data.at(-1)!.time };
		return ({ chart }) => chart.timeScale().setVisibleRange(range);
	});
</script>

<Series type={LineSeries} {data} {options} {callback} {priceScaleCalculator} />
