<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import type { TimeInterval } from 'd3-time';
	import type { AutoscaleInfo, HistogramData, HistogramSeriesPartialOptions, UTCTimestamp } from 'lightweight-charts';
	import type { SimpleDataItem, TvDataItem } from './types';
	import { HistogramSeries } from 'lightweight-charts';
	import Series from '$lib/charts/Series.svelte';
	import { getChartContext } from './TvChart.svelte';
	import { dateToTs, tsToDate } from './helpers';
	import { merge } from '$lib/helpers/object';
	import { max } from 'd3-array';

	const { colors } = getChartContext();

	type SeriesProps = ComponentProps<typeof Series>;
	type SupportedSeriesProps = Omit<SeriesProps, 'type' | 'data' | 'dataFeed' | 'options'>;

	type Props = Partial<SupportedSeriesProps> & {
		data: [number, number][];
		interval: TimeInterval;
		options?: HistogramSeriesPartialOptions;
	};

	let { data, interval, options, priceScaleOptions, priceScaleCalculator, ...restProps }: Props = $props();

	// Bin netflow values by chart interval
	let binnedData = $derived(
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

	// prevent price scale from scaling too small (smallest max value = 1000)
	function netflowPriceScaleCalculator(data: TvDataItem[]): AutoscaleInfo | null {
		const maxNetflowValue = max(data as SimpleDataItem[], ({ value }) => value) ?? 0;
		return {
			priceRange: {
				minValue: 0,
				maxValue: Math.max(1000, maxNetflowValue)
			}
		};
	}
</script>

<Series
	type={HistogramSeries}
	data={binnedData}
	options={merge({ ...baseOptions }, options)}
	priceScaleOptions={priceScaleOptions ?? defaultPriceScaleOptions}
	priceScaleCalculator={priceScaleCalculator ?? netflowPriceScaleCalculator}
	{...restProps}
/>
