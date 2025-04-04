<script lang="ts">
	import type { LendingReserve } from '$lib/explorer/lending-reserve-client';
	import type { ApiCandle, CandleTimeBucket } from './types';
	import { CandleDataFeed, apiCandleToDataItem, tsToUnixTimestamp } from './candle-data-feed.svelte';
	import { type LineSeriesPartialOptions, LineSeries } from 'lightweight-charts';
	import TvChart from './TvChart.svelte';
	import CandleSeries from './CandleSeries.svelte';
	import Series from './Series.svelte';

	type Props = {
		reserve: LendingReserve;
		timeBucket: CandleTimeBucket;
	};

	let { reserve, timeBucket }: Props = $props();

	let urlParams = $derived({
		chain_slug: reserve.chain_slug,
		protocol_slug: reserve.protocol_slug,
		reserve_slug: reserve.reserve_slug
	});

	let variableBorrowAprFeed = $derived(
		new CandleDataFeed(
			fetch,
			'lending-reserve/candles',
			timeBucket,
			{ ...urlParams, candle_types: 'variable_borrow_apr' },
			(data) => data.variable_borrow_apr.map((c: ApiCandle) => apiCandleToDataItem(c))
		)
	);

	let supplyAprFeed = $derived(
		new CandleDataFeed(
			fetch,
			'lending-reserve/candles',
			timeBucket,
			{ ...urlParams, candle_types: 'supply_apr' },
			(data) => data.supply_apr.map((c: ApiCandle) => ({ time: tsToUnixTimestamp(c.ts), value: c.c }))
		)
	);

	const options: LineSeriesPartialOptions = {
		color: 'mediumslateblue',
		lineWidth: 2,
		lastValueVisible: false,
		priceLineVisible: false
	};
</script>

<div class="reserve-interest-chart">
	<TvChart loading={variableBorrowAprFeed.loadingInitialData}>
		<CandleSeries dataFeed={variableBorrowAprFeed} />
		<Series type={LineSeries} dataFeed={supplyAprFeed} {options} />
	</TvChart>
</div>

<style>
	.reserve-interest-chart {
		/*  */
	}
</style>
