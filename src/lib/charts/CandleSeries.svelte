<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import type { CandleDataFeed } from './candle-data-feed.svelte';
	import { type CandlestickSeriesPartialOptions, CandlestickSeries } from 'lightweight-charts';
	import Series from '$lib/charts/Series.svelte';
	import { getChartContext } from './TvChart.svelte';
	import { merge } from '$lib/helpers/object';

	const { colors } = getChartContext();

	type SeriesProps = ComponentProps<typeof Series>;
	type SupportedSeriesProps = Omit<SeriesProps, 'type' | 'data'>;

	type Props = Partial<SupportedSeriesProps> & {
		dataFeed: CandleDataFeed;
		options?: CandlestickSeriesPartialOptions;
	};

	let { dataFeed, options, ...restProps }: Props = $props();

	const baseOptions: CandlestickSeriesPartialOptions = {
		upColor: colors.bullish,
		downColor: colors.bearish,
		wickUpColor: colors.bullish,
		wickDownColor: colors.bearish,
		borderVisible: false,
		priceLineVisible: false
	};

	// use neutral color for neutral candles
	let data = $derived(
		dataFeed.data.map(({ ...c }) => {
			if (c.open === c.close) {
				c.color ??= c.wickColor = colors.text;
			}
			return c;
		})
	);
</script>

<Series type={CandlestickSeries} {dataFeed} {data} options={merge({ ...baseOptions }, options)} {...restProps} />
