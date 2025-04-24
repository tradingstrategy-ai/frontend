<script lang="ts">
	import type { ApiCandle, CandleTimeBucket, SimpleDataItem } from './types';
	import type { BenchmarkToken } from 'trade-executor/helpers/benchmark.svelte';
	import { type LineSeriesPartialOptions, LineSeries } from 'lightweight-charts';
	import Series from './Series.svelte';
	import { tsToUnixTimestamp } from './candle-data-feed.svelte';
	import { fetchPublicApi } from '$lib/helpers/public-api';
	import { dateToTs, tsToDate } from './helpers';

	type Props = {
		token: BenchmarkToken;
		data: SimpleDataItem[];
		timeBucket: CandleTimeBucket;
		range: [Date, Date];
	};

	let { token, data, timeBucket, range }: Props = $props();

	let initialDataValue = $derived.by(() => {
		const initialTs = dateToTs(range[0]);
		return data.find((i) => i.time === initialTs)?.value ?? 0;
	});

	const options: LineSeriesPartialOptions = {
		color: token.color,
		lineWidth: 2,
		priceLineVisible: false,
		crosshairMarkerVisible: false
	};

	let benchmarkData: SimpleDataItem[] = $state([]);

	$effect(() => {
		fetchBenchmarkData();
	});

	async function fetchBenchmarkData() {
		token.loading = true;
		benchmarkData = [];

		const pairCandles = await fetchPublicApi(fetch, 'candles', {
			pair_id: token.pairId,
			exchange_type: token.exchangeType,
			candle_type: 'price',
			time_bucket: timeBucket,
			start: range[0].toISOString().slice(0, 19),
			end: range[1].toISOString().slice(0, 19)
		});

		const candles = (pairCandles[token.pairId] ?? []) as ApiCandle[];

		const initialBenchmarkValue = candles[0]?.c ?? 0;

		benchmarkData = candles.map(({ ts, c }) => {
			const percentChange = (c - initialBenchmarkValue) / initialBenchmarkValue;
			return {
				time: tsToUnixTimestamp(ts),
				value: percentChange + initialDataValue,
				customValues: { percentChange }
			};
		});

		token.periodPerformance = benchmarkData.at(-1)?.customValues?.percentChange as number | undefined;
		token.loading = false;
	}
</script>

<Series type={LineSeries} data={benchmarkData} {options} />
