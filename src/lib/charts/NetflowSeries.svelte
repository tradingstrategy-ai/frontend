<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import type { TimeInterval } from 'd3-time';
	import type { HistogramData, HistogramSeriesPartialOptions, UTCTimestamp } from 'lightweight-charts';
	import { HistogramSeries } from 'lightweight-charts';
	import Series from '$lib/charts/Series.svelte';
	import { getChartContext } from './TvChart.svelte';
	import { dateToTs, tsToDate } from './helpers';
	import { merge } from '$lib/helpers/object';

	const { colors } = getChartContext();

	type SeriesProps = ComponentProps<typeof Series>;
	type SupportedSeriesProps = Omit<SeriesProps, 'type' | 'data' | 'dataFeed' | 'options'>;

	type Props = Partial<SupportedSeriesProps> & {
		data: [number, number][];
		interval: TimeInterval;
		options?: HistogramSeriesPartialOptions;
	};

	let { data, interval, options, priceScaleOptions, ...restProps }: Props = $props();

	// Sum netflow values within the same chart interval
	let summarizedData = $derived(
		data.reduce((acc, [ts, value]) => {
			const date = tsToDate(ts);
			const normalizedTs = dateToTs(interval.floor(date));
			if (normalizedTs !== acc.at(-1)?.time) {
				acc.push({ time: normalizedTs, value: 0 });
			}
			const current = acc.at(-1)!;
			current.value += value;
			current.color = current.value > 0 ? colors.bullish : colors.bearish;
			return acc;
		}, [] as HistogramData<UTCTimestamp>[])
	);

	const baseOptions: HistogramSeriesPartialOptions = {
		priceLineVisible: false,
		lastValueVisible: false
	};

	const defaultPriceScaleOptions = { scaleMargins: { top: 0.2, bottom: 0 } };
</script>

<Series
	type={HistogramSeries}
	data={summarizedData}
	priceScaleOptions={priceScaleOptions ?? defaultPriceScaleOptions}
	options={merge({ ...baseOptions }, options)}
	{...restProps}
/>
