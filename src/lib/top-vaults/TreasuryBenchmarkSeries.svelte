<!--
@component
Overlay a US 3-month Treasury bill benchmark line on the vault share-price chart.

The benchmark compounds daily FRED DTB3 rates into a cumulative return line
rebased to the vault's starting share price, so relative performance is
comparable on a single axis. Does not affect Y-axis scaling.
-->
<script lang="ts">
	import type { TimeBucket } from '$lib/schemas/utility';
	import type { LineSeriesPartialOptions } from 'lightweight-charts';
	import type { SimpleDataItem } from '$lib/charts/types';
	import type { TreasuryDataItem } from './treasury-benchmark';
	import { LineSeries } from 'lightweight-charts';
	import Series from '$lib/charts/Series.svelte';
	import { dateToTs, timeBucketToInterval } from '$lib/charts/helpers';
	import { fetchTreasuryBenchmarkSeries, ratesToCumulativeReturn } from './treasury-benchmark';

	interface Props {
		data: SimpleDataItem[];
		timeBucket: TimeBucket;
		range: [Date, Date];
		color: string;
	}

	let { data, timeBucket, range, color }: Props = $props();

	let benchmarkData = $state<TreasuryDataItem[]>([]);
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
			const rates = await fetchTreasuryBenchmarkSeries(fetch, effectiveStartDate, range[1]);
			if (currentRequest !== requestVersion || rates.length === 0) return;

			const interval = timeBucketToInterval(timeBucket);
			benchmarkData = ratesToCumulativeReturn(rates, initialVaultValue, interval, effectiveStartDate, range[1]);
		} catch (error) {
			if (currentRequest === requestVersion) {
				console.error('Failed to load Treasury benchmark', error);
			}
		}
	}
</script>

<Series type={LineSeries} data={benchmarkData} {options} priceScaleCalculator={() => null} />
