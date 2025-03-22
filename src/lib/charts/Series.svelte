<script lang="ts">
	import type {
		DataItem,
		DeepPartial,
		LogicalRange,
		PriceScaleOptions,
		SeriesDefinition,
		SeriesPartialOptionsMap,
		SeriesType,
		UTCTimestamp
	} from 'lightweight-charts';
	import type { CandleDataFeed } from './candle-data-feed.svelte';
	import { getChartContext } from './TvChart.svelte';

	const LOGICAL_RANGE_THRESHOLD = 50;

	const { chart } = getChartContext();

	type Props = {
		type: SeriesDefinition<SeriesType>;
		data?: DataItem<UTCTimestamp>[];
		dataFeed?: CandleDataFeed;
		options?: SeriesPartialOptionsMap[SeriesType];
		priceScale?: DeepPartial<PriceScaleOptions>;
	};

	let { type, data, dataFeed, options, priceScale }: Props = $props();

	const series = chart.addSeries(type, options);

	if (priceScale) {
		series.priceScale().applyOptions(priceScale);
	}

	function handleRangeChange(logicalRange: LogicalRange | null) {
		if (!dataFeed?.hasMoreData || logicalRange === null) return;
		const { to, from } = logicalRange;
		if (from < LOGICAL_RANGE_THRESHOLD) {
			const ticksVisible = Math.round(to - from) + 1;
			dataFeed.fetchData(ticksVisible * 2);
		}
	}

	$effect(() => {
		if (dataFeed?.loadingInitialData) {
			chart.timeScale().scrollToRealTime();
		}
	});

	// update series when data changes
	$effect(() => {
		series.setData(data ?? dataFeed!.data);
	});

	// subscribe range changes (due to pan/zoom interactions)
	$effect(() => {
		chart.timeScale().subscribeVisibleLogicalRangeChange(handleRangeChange);
		return () => {
			chart.timeScale().unsubscribeVisibleLogicalRangeChange(handleRangeChange);
		};
	});
</script>
