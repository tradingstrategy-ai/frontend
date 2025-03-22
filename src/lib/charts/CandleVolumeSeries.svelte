<script lang="ts">
	import type { CandleDataFeed } from './candle-data-feed.svelte';
	import { HistogramSeries } from 'lightweight-charts';
	import Series from '$lib/charts/Series.svelte';
	import { getChartContext } from './TvChart.svelte';

	const { colors } = getChartContext();

	type Props = {
		dataFeed: CandleDataFeed;
	};

	let { dataFeed }: Props = $props();

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
