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
	import { type Snippet, mount, unmount } from 'svelte';
	import SeriesContent from './SeriesContent.svelte';
	import { getChartContext } from './TvChart.svelte';

	const LOGICAL_RANGE_THRESHOLD = 50;

	const { chart, colors } = getChartContext();

	type Props = {
		type: SeriesDefinition<SeriesType>;
		data?: DataItem<UTCTimestamp>[];
		dataFeed?: CandleDataFeed;
		options?: SeriesPartialOptionsMap[SeriesType];
		paneIndex?: number;
		priceScale?: DeepPartial<PriceScaleOptions>;
		children?: Snippet;
	};

	let { type, data, dataFeed, options, paneIndex = 0, priceScale, children }: Props = $props();

	const series = chart.addSeries(type, options, paneIndex);

	let seriesContent: Record<string, any> | undefined = undefined;

	// apply default priceScale options and any custom ones provided as prop
	series.priceScale().applyOptions({
		borderColor: colors.axisBorder,
		...priceScale
	});

	function handleRangeChange(logicalRange: LogicalRange | null) {
		if (!dataFeed?.hasMoreData || logicalRange === null) return;
		const { from, to } = logicalRange;
		if (from < LOGICAL_RANGE_THRESHOLD) {
			const ticksVisible = Math.round(to - from) + 1;
			dataFeed.fetchData(ticksVisible * 2);
		}
	}

	// reset primary pane x-axis scale when dataFeed is reset (e.g., time interval change)
	$effect(() => {
		if (paneIndex === 0 && dataFeed?.loadingInitialData) {
			chart.timeScale().resetTimeScale();
		}
	});

	// update series when data changes
	$effect(() => {
		series.setData(data ?? dataFeed!.data);
	});

	// mount/unmount SeriesContent to inject children into the series pane element
	$effect(() => {
		if (seriesContent) unmount(seriesContent);

		if (!children) return;

		// push to event loop to allow TradingView to first create the series pane elements
		setTimeout(() => {
			try {
				const target = series.getPane().getHTMLElement().querySelector('td:nth-child(2)');
				if (!target) throw new Error('No series target HTML element found.');
				seriesContent = mount(SeriesContent, { target, props: { children } });
			} catch (e) {
				console.error(e);
			}
		}, 100);
	});

	// subscribe range changes (due to pan/zoom interactions)
	$effect(() => {
		chart.timeScale().subscribeVisibleLogicalRangeChange(handleRangeChange);
		return () => {
			chart.timeScale().unsubscribeVisibleLogicalRangeChange(handleRangeChange);
		};
	});
</script>
