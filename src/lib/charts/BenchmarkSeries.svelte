<script lang="ts">
	import type { ApiCandle, CandleTimeBucket, SimpleDataItem } from './types';
	import type { BenchmarkToken } from 'trade-executor/helpers/benchmark.svelte';
	import { type LineSeriesPartialOptions, LineSeries, LineType } from 'lightweight-charts';
	import { tsToUnixTimestamp } from './candle-data-feed.svelte';
	import Series from './Series.svelte';
	import { fetchPublicApi } from '$lib/helpers/public-api';
	import { tsToDate } from './helpers';

	type Props = {
		token: BenchmarkToken;
		timeBucket: CandleTimeBucket;
		firstDataItem: SimpleDataItem;
		endDate: Date;
	};

	let { token, timeBucket, firstDataItem, endDate }: Props = $props();

	const options: LineSeriesPartialOptions = {
		lineType: LineType.Curved,
		color: token.color,
		lineWidth: 2,
		priceLineVisible: false,
		crosshairMarkerVisible: false
	};

	let data: SimpleDataItem[] = $state([]);

	$effect(() => {
		fetchData();
	});

	async function fetchData() {
		token.loading = true;
		data = [];

		const pairCandles = await fetchPublicApi(fetch, 'candles', {
			pair_id: token.pairId,
			exchange_type: token.exchangeType,
			candle_type: 'price',
			time_bucket: timeBucket,
			start: tsToDate(firstDataItem.time).toISOString().slice(0, 19),
			end: endDate.toISOString().slice(0, 19)
		});

		const candles = (pairCandles[token.pairId] ?? []) as ApiCandle[];

		const initialValue = candles[0]?.c ?? 0;

		data = candles.map(({ ts, c }) => {
			const percentChange = (c - initialValue) / initialValue;
			return {
				time: tsToUnixTimestamp(ts),
				value: percentChange + firstDataItem.value,
				customValues: { percentChange }
			};
		});

		token.periodPerformance = data.at(-1)?.customValues?.percentChange as number | undefined;
		token.loading = false;
	}
</script>

<Series type={LineSeries} {data} {options} />
