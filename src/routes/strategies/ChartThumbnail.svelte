<script lang="ts">
	import type { TvChartOptions } from '$lib/charts/types';
	import type { AreaSeriesPartialOptions, AreaData, UTCTimestamp, LineSeriesPartialOptions } from 'lightweight-charts';
	import TvChart from '$lib/charts/TvChart.svelte';
	import AreaSeries from '$lib/charts/AreaSeries.svelte';
	import BaselineSeries from '$lib/charts/BaselineSeries.svelte';
	import { utcDay } from 'd3-time';
	import { relativeReturn } from '$lib/helpers/financial';
	import { getProfitInfo } from '$lib/components/Profitability.svelte';

	interface Props {
		data: AreaData<UTCTimestamp>[];
		dateRange: [Date, Date];
	}

	let { data, dateRange }: Props = $props();

	// TODO: should be based on displayed data range rather than full range?
	const relativeProfit = getProfitInfo(relativeReturn(data[0]?.value, data.at(-1)?.value));

	// TEMPORARY HACK: filter duplicate / out-of-order items
	// see: https://github.com/tradingstrategy-ai/trade-executor/issues/1160
	const tvData = data.filter(({ time }, index) => {
		return time >= data[index - 1]?.time;
	});

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
		priceLineVisible: false,
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
		<BaselineSeries interval={utcDay} range={dateRange} alwaysVisible setChartVisibleRange />
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
