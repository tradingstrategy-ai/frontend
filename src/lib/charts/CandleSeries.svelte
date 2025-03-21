<script lang="ts">
	import type { CandleDataFeed } from './candle-data-feed.svelte';
	import { type IChartApi, CandlestickSeries } from 'lightweight-charts';
	import Series from '$lib/charts/Series.svelte';

	type Props = {
		chart: IChartApi;
		dataFeed: CandleDataFeed;
		colors: { bullish: string; bearish: string };
	};

	let { chart, dataFeed, colors }: Props = $props();

	const options = {
		upColor: colors.bullish,
		downColor: colors.bearish,
		wickUpColor: colors.bullish,
		wickDownColor: colors.bearish,
		borderVisible: false
	};
</script>

<Series type={CandlestickSeries} {chart} {dataFeed} {options} />
