<script lang="ts">
	import type { TvChartOptions } from '$lib/charts/types';
	import { type AreaSeriesPartialOptions, type AreaData, type UTCTimestamp, LineType } from 'lightweight-charts';
	import TvChart from '$lib/charts/TvChart.svelte';
	import AreaSeries from '$lib/charts/AreaSeries.svelte';
	import { relativeProfitability } from '$lib/helpers/profit';
	import { getProfitInfo } from '$lib/components/Profitability.svelte';

	export let data: AreaData<UTCTimestamp>[] = [];
	export let dateRange: [Date?, Date?];

	// TODO: should be based on displayed data range rather than full range?
	const relativeProfit = getProfitInfo(relativeProfitability(data[0]?.value, data.at(-1)?.value));

	// TEMPORARY HACK: filter duplicate / out-of-order items
	// see: https://github.com/tradingstrategy-ai/trade-executor/issues/1160
	$: tvData = data.filter(({ time }, index) => {
		return time >= data[index - 1]?.time;
	});

	const hidden = { visible: false };

	const chartOptions: TvChartOptions = {
		handleScroll: false,
		handleScale: false,
		grid: { vertLines: hidden, horzLines: hidden },
		crosshair: { vertLine: hidden, horzLine: hidden },
		rightPriceScale: hidden,
		timeScale: {
			...hidden,
			lockVisibleTimeRangeOnResize: true
		}
	};

	const seriesOptions: AreaSeriesPartialOptions = {
		lineWidth: 2,
		lineType: LineType.Curved,
		priceLineVisible: false,
		crosshairMarkerVisible: false
	};
</script>

<figure class="chart-thumbnail ds-3 {relativeProfit.directionClass}">
	<TvChart priceFormatter={() => ''} options={chartOptions}>
		<AreaSeries data={tvData} direction={relativeProfit.direction} options={seriesOptions} />
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
