<script lang="ts">
	import {
		type DeepPartial,
		type LogicalRange,
		type PriceScaleOptions,
		type SeriesDefinition,
		type SeriesPartialOptionsMap,
		type SeriesType
	} from 'lightweight-charts';
	import type { DataFeed, PriceScaleCalculator, TvDataItem } from './types';
	import { type Snippet, mount, unmount, untrack } from 'svelte';
	import SeriesContent from './SeriesContent.svelte';
	import { getChartContext } from './TvChart.svelte';

	const LOGICAL_RANGE_THRESHOLD = 100;

	const { chart, colors } = getChartContext();

	type Props = {
		type: SeriesDefinition<SeriesType>;
		data?: TvDataItem[];
		dataFeed?: DataFeed;
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
	function getVisibleData(): TvDataItem[] {
		if (!visibileLogicalRange) return [];

		const data = series.data() as TvDataItem[];
		const { from, to } = visibileLogicalRange;

		const barsInfo = series.barsInLogicalRange({ from, to });
		if (!barsInfo) return [];

		const startIndex = data.findIndex((c) => c.time === barsInfo?.from);
		const endIndex = data.findIndex((c) => c.time === barsInfo?.to);
		return data.slice(startIndex, endIndex + 1);
	}

	function handleRangeChange(range: LogicalRange | null) {
		visibileLogicalRange = range;

		if (dataFeed?.hasMoreData && range && range.from < LOGICAL_RANGE_THRESHOLD) {
			dataFeed.fetchData();
		}
	}

	// fetch initial data whenever a new dataFeed is provided
	$effect(() => {
		if (dataFeed) {
			// prevent effect from triggering itself
			untrack(() => dataFeed.fetchData());
		}
	});

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

		// Use requestAnimationFrame to push to event loop and only run when window is in foreground
		// (allows TradingView to first create the series pane elements)
		requestAnimationFrame(() => {
			const target = series.getPane().getHTMLElement().querySelector('td:nth-child(2)');
			if (target) {
				seriesContent = mount(SeriesContent, { target, props: { children } });
			}
		});
	});

	// subscribe range changes (due to pan/zoom interactions)
	$effect(() => {
		chart.timeScale().subscribeVisibleLogicalRangeChange(handleRangeChange);
		return () => {
			chart.timeScale().unsubscribeVisibleLogicalRangeChange(handleRangeChange);
		};
	});
</script>
