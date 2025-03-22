<script lang="ts">
	import type { CandleDataFeed } from './candle-data-feed.svelte';
	import { CandlestickSeries } from 'lightweight-charts';
	import Series from '$lib/charts/Series.svelte';
	import { getChartContext } from './TvChart.svelte';

	const { colors } = getChartContext();

	type Props = {
		dataFeed: CandleDataFeed;
	};

	let { dataFeed }: Props = $props();

	const options = {
		upColor: colors.bullish,
		downColor: colors.bearish,
		wickUpColor: colors.bullish,
		wickDownColor: colors.bearish,
		borderVisible: false
	};
</script>

<Series type={CandlestickSeries} {dataFeed} {options} />
