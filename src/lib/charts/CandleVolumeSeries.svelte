<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import type { DataFeed, CandleDataItem } from './types';
	import { HistogramSeries } from 'lightweight-charts';
	import Series from '$lib/charts/Series.svelte';
	import { getChartContext } from './TvChart.svelte';
	import { merge } from '$lib/helpers/object';

	const { colors } = getChartContext();

	type SeriesProps = ComponentProps<typeof Series>;
	type SupportedSeriesProps = Omit<SeriesProps, 'type' | 'data' | 'dataFeed'>;

	type Props = Partial<SupportedSeriesProps> & {
		dataFeed: DataFeed<CandleDataItem>;
	};

	let { dataFeed, options, ...restProps }: Props = $props();

	let data = $derived(
		dataFeed.data.map((c) => ({
			time: c.time,
			value: c.customValues?.volume,
			color: c.close > c.open ? colors.bullish30 : colors.bearish30
		}))
	);

	const baseOptions = {
		priceFormat: { type: 'volume' },
		priceScaleId: '',
		lastValueVisible: false
	};
</script>

<Series type={HistogramSeries} {data} options={merge({ ...baseOptions }, options)} {...restProps} />
