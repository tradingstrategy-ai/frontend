<script lang="ts">
	import { chartWickThreshold } from '$lib/config';
	import type { ComponentProps } from 'svelte';
	import { type CandlestickSeriesPartialOptions, type AutoscaleInfo, CandlestickSeries } from 'lightweight-charts';
	import type { CandleDataItem, TvDataItem, DataFeed } from './types';
	import Series from '$lib/charts/Series.svelte';
	import { getChartContext } from './TvChart.svelte';
	import { merge } from '$lib/helpers/object';

	const { colors } = getChartContext();

	type SeriesProps = ComponentProps<typeof Series>;
	type SupportedSeriesProps = Omit<SeriesProps, 'type' | 'data' | 'dataFeed' | 'options' | 'priceScaleCalculator'>;

	type Props = Partial<SupportedSeriesProps> & {
		dataFeed: DataFeed<CandleDataItem>;
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

	/**
	 * Custom PriceScaleCalculator for trading pair price candle data
	 *
	 * By default, TradingView CandlestickSeries determines price scale using min/max
	 * of all currently displayed candle values. For trading pairs with extremely long
	 * wicks (high/low values), this results in an overly flattened-out price scale.
	 * E.g.: http://localhost:5173/trading-view/arbitrum/uniswap-v3/crv-eth-fee-30
	 *
	 * calculateClippedCandleScale address this by clipping the high/low values based on a
	 * configurable threshold.
	 */
	export function calculateClippedCandleScale(candles: TvDataItem[]): AutoscaleInfo | null {
		if (candles.length === 0) return null;

		const priceRange = (candles as CandleDataItem[]).reduce(
			({ minValue, maxValue }, { open, high, low, close }) => {
				const clippedLow = Math.max(low, Math.min(open, close) * (1 - chartWickThreshold));
				const clippedHigh = Math.min(high, Math.max(open, close) * (1 + chartWickThreshold));
				return {
					minValue: Math.min(minValue, clippedLow),
					maxValue: Math.max(maxValue, clippedHigh)
				};
			},
			// initial accumulator: ±Infinity ensures any candle value will be lower/higher
			{ minValue: Infinity, maxValue: -Infinity }
		);

		return { priceRange };
	}
</script>

<Series
	type={CandlestickSeries}
	{dataFeed}
	{data}
	options={merge({ ...baseOptions }, options)}
	priceScaleCalculator={calculateClippedCandleScale}
	{...restProps}
/>
