<script lang="ts">
	import type { CandleDataFeed } from './candle-data-feed.svelte';
	import { type IChartApi, HistogramSeries } from 'lightweight-charts';
	import Series from '$lib/charts/Series.svelte';

	type Props = {
		chart: IChartApi;
		dataFeed: CandleDataFeed;
		colors: { bullish30: string; bearish30: string };
	};

	let { chart, dataFeed, colors }: Props = $props();

	let data = $derived(
		dataFeed.data.map((c) => ({
			time: c.time,
			value: c.customValues?.volume,
			color: c.close > c.open ? colors.bullish30 : colors.bearish30
		}))
	);
</script>

<Series
	type={HistogramSeries}
	{chart}
	{data}
	options={{
		priceFormat: { type: 'volume' },
		priceScaleId: '',
		lastValueVisible: false
	}}
	priceScale={{
		scaleMargins: { top: 0.7, bottom: 0 }
	}}
/>
