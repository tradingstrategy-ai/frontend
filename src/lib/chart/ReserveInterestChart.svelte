<script lang="ts">
	import { quoteFeed, ChartIQ } from '$lib/chart';
	import { type TimeBucket, timeBucketToPeriodicity } from '$lib/chart/timeBucketConverters';

	export let reserve: any;
	export let timeBucket: TimeBucket;
	export let rateType: string;

	$: ({ chain_slug, protocol_slug, reserve_slug } = reserve);
	$: symbol = `${chain_slug}-${protocol_slug}-${reserve_slug}`.toUpperCase();
	$: periodicity = timeBucketToPeriodicity(timeBucket);

	const reserveQuoteFeed = quoteFeed('lending-reserve/candles', rateType);

	const options = {
		controls: { chartControls: null },
		chart: {
			yAxis: {
				decimalPlaces: 2,
				maxDecimalPlaces: 4
			}
		}
	};

	function init(chartEngine: any) {
		// HACK to address ChartIQ bug - times in floating x-axis label are off by 3h for 4h timeBucket
		const originalFormatter = chartEngine.chart.xAxis.formatter;
		chartEngine.chart.xAxis.formatter = function (labelDate: Date) {
			const adjustedDate = new Date(labelDate);
			if (timeBucket === '4h') {
				adjustedDate.setUTCHours(adjustedDate.getUTCHours() + 3);
			}
			return originalFormatter(adjustedDate);
		};

		// update the chart - used on both initial load and updates
		function update() {
			// pass required data to quoteFeed
			const symbolObject = {
				symbol,
				urlParams: { chain_slug, protocol_slug, reserve_slug, candle_types: rateType, time_bucket: timeBucket }
			};
			// load the chart
			chartEngine.loadChart(symbolObject, { periodicity });
		}

		return { update };
	}
</script>

<ChartIQ
	{init}
	{options}
	quoteFeed={reserveQuoteFeed}
	invalidate={[chain_slug, protocol_slug, reserve_slug, periodicity]}
/>
