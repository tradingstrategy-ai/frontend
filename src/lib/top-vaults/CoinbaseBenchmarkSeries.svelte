<!--
@component
Overlay a Coinbase benchmark line on top of the vault share-price chart.

The benchmark is rebased to the vault's starting share price for the current
visible range so the lines can be compared on a single axis.
-->
<script lang="ts">
	import type { TimeBucket } from '$lib/schemas/utility';
	import type { LineSeriesPartialOptions } from 'lightweight-charts';
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
			const closes = await fetchCoinbaseBenchmarkCloses(fetch, productId, timeBucket, effectiveStartDate, range[1]);
			if (currentRequest !== requestVersion || closes.length === 0) return;

			const resampledCloses = resampleTimeSeries(closes, timeBucketToInterval(timeBucket), range[1]);
			const initialBenchmarkValue = resampledCloses[0]?.value ?? 0;
			if (initialBenchmarkValue <= 0) return;

			benchmarkData = resampledCloses.map((item) => {
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

<Series type={LineSeries} data={benchmarkData} {options} />
