<script lang="ts">
	import {
		type DeepPartial,
		type LogicalRange,
		type PriceScaleOptions,
		type SeriesDefinition,
		type SeriesPartialOptionsMap,
		type SeriesType
	} from 'lightweight-charts';
	import type { SeriesDataItem, PriceScaleCalculator } from './types';
	import type { CandleDataFeed } from './candle-data-feed.svelte';
	import { type Snippet, mount, unmount } from 'svelte';
	import SeriesContent from './SeriesContent.svelte';
	import { getChartContext } from './TvChart.svelte';

	const LOGICAL_RANGE_THRESHOLD = 50;

	const { chart, colors } = getChartContext();

	type Props = {
		type: SeriesDefinition<SeriesType>;
		data?: SeriesDataItem[];
		dataFeed?: CandleDataFeed;
		options?: SeriesPartialOptionsMap[SeriesType];
		paneIndex?: number;
		priceScaleOptions?: DeepPartial<PriceScaleOptions>;
		priceScaleCalculator?: PriceScaleCalculator;
		children?: Snippet;
	};

	let {
		type,
		data,
		dataFeed,
		options,
		paneIndex = 0,
		priceScaleOptions,
		priceScaleCalculator,
		children
	}: Props = $props();

	let visibileLogicalRange: LogicalRange | null = null;

	let seriesContent: Record<string, any> | undefined = undefined;

	const series = chart.addSeries(type, options, paneIndex);

	// apply default priceScale options and any custom ones provided as prop
	series.priceScale().applyOptions({
		borderColor: colors.axisBorder,
		...priceScaleOptions
	});

	// apply priceScaleCalculator if one was provided
	if (priceScaleCalculator) {
		series.applyOptions({
			autoscaleInfoProvider: () => priceScaleCalculator(getVisibleData())
		});
	}

	// Get currently visible chart data segment
	function getVisibleData(): SeriesDataItem[] {
		if (!visibileLogicalRange) return [];

		const data = series.data() as SeriesDataItem[];
		const { from, to } = visibileLogicalRange;

		const barsInfo = series.barsInLogicalRange({ from, to });
		if (!barsInfo) return [];

		const startIndex = data.findIndex((c) => c.time === barsInfo?.from);
		const endIndex = data.findIndex((c) => c.time === barsInfo?.to);
		return data.slice(startIndex, endIndex + 1);
	}

	function handleRangeChange(range: LogicalRange | null) {
		visibileLogicalRange = range;

		if (!dataFeed?.hasMoreData || !range) return;

		if (range.from < LOGICAL_RANGE_THRESHOLD) {
			const ticksVisible = Math.round(range.to - range.from) + 1;
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
