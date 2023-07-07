<script lang="ts">
	import { type Candle, candleToQuote, quoteFeed, ChartIQ } from '$lib/chart';
	import { type TimeBucket, timeBucketToPeriodicity } from '$lib/chart/timeBucketConverters';

	const rateTypes = ['supply_apr', 'stable_borrow_apr', 'variable_borrow_apr'] as const;

	export let reserve: any;
	export let timeBucket: TimeBucket;
	export let rateType: (typeof rateTypes)[number];

	$: ({ chain_slug, protocol_slug, reserve_slug } = reserve);
	$: symbol = `${chain_slug}-${protocol_slug}-${reserve_slug}`.toUpperCase();
	$: periodicity = timeBucketToPeriodicity(timeBucket);

	const feed = quoteFeed('lending-reserve/candles', (data: any) => {
		return data[rateType].map((candle: Candle, idx: number) => {
			const quote = candleToQuote(candle);
			for (const type of rateTypes) {
				quote[type] = data[type]?.[idx]?.c;
			}
			return quote;
		});
	});

	const options = {
		layout: { crosshair: true },
		controls: { chartControls: null },
		preferences: { labels: false },
		chart: {
			yAxis: {
				drawCurrentPriceLabel: false,
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
				urlParams: { chain_slug, protocol_slug, reserve_slug, candle_types: 'all', time_bucket: timeBucket }
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
	{feed}
	studies={['Interest Rates']}
	invalidate={[chain_slug, protocol_slug, reserve_slug, periodicity]}
/>
