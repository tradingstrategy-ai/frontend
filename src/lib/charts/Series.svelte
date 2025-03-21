<script lang="ts">
	import type {
		DataItem,
		DeepPartial,
		IChartApi,
		LogicalRange,
		PriceScaleOptions,
		SeriesDefinition,
		SeriesPartialOptionsMap,
		SeriesType,
		UTCTimestamp
	} from 'lightweight-charts';
	import type { CandleDataFeed } from './candle-data-feed.svelte';

	const LOGICAL_RANGE_THRESHOLD = 50;

	type Props = {
		type: SeriesDefinition<SeriesType>;
		chart: IChartApi;
		data?: DataItem<UTCTimestamp>[];
		dataFeed?: CandleDataFeed;
		options?: SeriesPartialOptionsMap[SeriesType];
		priceScale?: DeepPartial<PriceScaleOptions>;
	};

	let { type, chart, data, dataFeed, options, priceScale }: Props = $props();

	let series = $derived(chart.addSeries(type, options));

	function handleRangeChange(logicalRange: LogicalRange | null) {
		if (!dataFeed?.hasMoreData || logicalRange === null) return;
		const { to, from } = logicalRange;
		if (from < LOGICAL_RANGE_THRESHOLD) {
			const ticksVisible = Math.round(to - from) + 1;
			dataFeed.fetchData(ticksVisible * 2);
		}
	}

	// apply price scale options
	$effect(() => {
		if (priceScale) {
			series.priceScale().applyOptions(priceScale);
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
