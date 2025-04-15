<script lang="ts">
	import type { SeriesCallbackParam, TvChartOptions } from '$lib/charts/types';
	import type { AreaSeriesPartialOptions, AreaData, UTCTimestamp, LineSeriesPartialOptions } from 'lightweight-charts';
	import { LineType, LineSeries } from 'lightweight-charts';
	import TvChart from '$lib/charts/TvChart.svelte';
	import AreaSeries from '$lib/charts/AreaSeries.svelte';
	import Series from '$lib/charts/Series.svelte';
	import { utcDay } from 'd3-time';
	import { dateToTs } from '$lib/charts/helpers';
	import { relativeProfitability } from '$lib/helpers/profit';
	import { getProfitInfo } from '$lib/components/Profitability.svelte';

	interface Props {
		data: AreaData<UTCTimestamp>[];
		dateRange: [Date, Date];
	}

	let { data, dateRange }: Props = $props();

	// TODO: should be based on displayed data range rather than full range?
	const relativeProfit = getProfitInfo(relativeProfitability(data[0]?.value, data.at(-1)?.value));

	// TEMPORARY HACK: filter duplicate / out-of-order items
	// see: https://github.com/tradingstrategy-ai/trade-executor/issues/1160
	const tvData = data.filter(({ time }, index) => {
		return time >= data[index - 1]?.time;
	});

	// Create baseline data set - needed to display baseline and to set chart date range
	const baselineData = utcDay.range(dateRange[0], utcDay.offset(dateRange[1])).map((d) => {
		return { time: dateToTs(d), value: 0 };
	});

	// Once baseline series loads, set the visible range to the baseline's start/end dates
	function baselineCallback({ chart }: SeriesCallbackParam) {
		chart.timeScale().setVisibleRange({
			from: baselineData[0].time,
			to: baselineData.at(-1)!.time
		});
	}

	const chartOptions: TvChartOptions = {
		handleScroll: false,
		handleScale: false,
		rightPriceScale: { visible: false },
		timeScale: {
			visible: false,
			lockVisibleTimeRangeOnResize: true
		}
	};

	const areaSeriesOptions: AreaSeriesPartialOptions = {
		lineWidth: 2,
		lineType: LineType.Curved,
		priceLineVisible: false,
		crosshairMarkerVisible: false
	};

	const baselineSeriesOptions: LineSeriesPartialOptions = {
		lineVisible: false,
		priceLineColor: 'gray',
		crosshairMarkerVisible: false
	};
</script>

<figure class="chart-thumbnail ds-3 {relativeProfit.directionClass}">
	<TvChart options={chartOptions}>
		<AreaSeries
			data={tvData}
			direction={relativeProfit.direction}
			options={areaSeriesOptions}
			priceScaleOptions={{ scaleMargins: { top: 0.2, bottom: 0.2 } }}
		/>
		<Series type={LineSeries} data={baselineData} options={baselineSeriesOptions} callback={baselineCallback} />
	</TvChart>
	<figcaption>Past 90 days historical performance</figcaption>
</figure>

<style>
	.chart-thumbnail {
		:global([data-css-props]) {
			--chart-height: 14rem;

			@media (--viewport-xs) {
				--chart-height: 11rem;
			}
		}

		position: relative;

		figcaption {
			position: absolute;
			bottom: 0;
			width: 100%;
			text-align: center;
			font: var(--f-ui-sm-medium);
			letter-spacing: var(--f-ui-md-spacing, normal);
			color: var(--c-text-extra-light);
			opacity: 0;
			transition: var(--transition-1);

			@media (--viewport-xs) {
				font: var(--f-ui-sm-roman);
				letter-spacing: var(--f-ui-sm-spacing, normal);
			}
		}
	}
</style>
