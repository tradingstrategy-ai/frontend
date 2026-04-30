<!--
@component
Overlay a Coinbase benchmark line on top of the vault share-price chart.

The benchmark is rebased to the vault's starting share price for the current
visible range so the lines can be compared on a single axis.
-->
<script lang="ts">
	import type { TimeBucket } from '$lib/schemas/utility';
	import type { LineSeriesPartialOptions, UTCTimestamp } from 'lightweight-charts';
	import type { SimpleDataItem } from '$lib/charts/types';
	import { LineSeries } from 'lightweight-charts';
	import Series from '$lib/charts/Series.svelte';
	import { dateToTs, resampleTimeSeries, timeBucketToInterval } from '$lib/charts/helpers';
	import { fetchCoinbaseBenchmarkCloses } from './coinbase';

	interface Props {
		productId: 'BTC-USD' | 'ETH-USD';
		data: SimpleDataItem[];
		timeBucket: TimeBucket;
		range: [Date, Date];
		color: string;
	}

	let { productId, data, timeBucket, range, color }: Props = $props();

	let benchmarkData = $state<SimpleDataItem[]>([]);
	let requestVersion = 0;

	let effectiveStartDate = $derived.by(() => {
		const firstVaultPoint = data[0];
		if (!firstVaultPoint) return range[0];
		return new Date(Math.max(range[0].getTime(), firstVaultPoint.time * 1000));
	});

	let initialVaultValue = $derived.by(() => {
		const initialTs = dateToTs(effectiveStartDate);
		return data.find((item) => item.time >= initialTs)?.value ?? data[0]?.value ?? 0;
	});

	let options: LineSeriesPartialOptions = $derived({
		color,
		lineWidth: 2,
		priceScaleId: 'crypto-benchmark',
		priceLineVisible: false,
		lastValueVisible: false,
		crosshairMarkerVisible: false
	});

	$effect(() => {
		void fetchBenchmarkData();
	});

	async function fetchBenchmarkData() {
		const currentRequest = ++requestVersion;
		benchmarkData = [];

		if (!data.length || initialVaultValue <= 0) return;

		try {
			const closes = await fetchCoinbaseBenchmarkCloses(fetch, productId, range[0], range[1]);
			if (currentRequest !== requestVersion || closes.length === 0) return;

			const interval = timeBucketToInterval(timeBucket);
			const benchmarkPoints = resampleTimeSeries(closes, interval, range[1]) as (SimpleDataItem & {
				time: UTCTimestamp;
			})[];
			const initialTs = dateToTs(effectiveStartDate);
			const initialBenchmarkValue =
				benchmarkPoints.find((item) => item.time >= initialTs)?.value ?? benchmarkPoints[0]?.value ?? 0;
			if (initialBenchmarkValue <= 0) return;

			benchmarkData = benchmarkPoints.map((item) => {
				const percentChange = item.value / initialBenchmarkValue - 1;
				return {
					time: item.time,
					value: initialVaultValue * (1 + percentChange),
					customValues: { percentChange, usdPrice: item.value }
				};
			});
		} catch (error) {
			if (currentRequest === requestVersion) {
				console.error(`Failed to load Coinbase benchmark ${productId}`, error);
			}
		}
	}
</script>

<Series
	type={LineSeries}
	data={benchmarkData}
	{options}
	priceScaleOptions={{ visible: false, scaleMargins: { top: 0.1, bottom: 0.1 } }}
/>
