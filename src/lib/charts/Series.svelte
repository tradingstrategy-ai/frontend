<script lang="ts">
	import {
		type DeepPartial,
		type ISeriesApi,
		type LogicalRange,
		type PriceScaleOptions,
		type SeriesDefinition,
		type SeriesPartialOptionsMap,
		type SeriesType
	} from 'lightweight-charts';
	import type { ChartCallbackReturnType, DataFeed, PriceScaleCalculator, SeriesCallback, TvDataItem } from './types';
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
		onVisibleDataChange?: (data: TvDataItem[]) => void;
		callback?: SeriesCallback;
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
		onVisibleDataChange,
		callback,
		children
	}: Props = $props();

	let visibleLogicalRange: LogicalRange | null = null;

	let series: ISeriesApi<SeriesType> | undefined = $state();

	// primary mount/unmount effect
	$effect(() => {
		// add the series to the chart
		series = chart.addSeries(type, {}, paneIndex);
		// subscribe range changes (resulting from pan/zoom interactions)
		chart.timeScale().subscribeVisibleLogicalRangeChange(handleRangeChange);

		return () => {
			if (series) {
				chart.removeSeries(series);
			}
			chart.timeScale().unsubscribeVisibleLogicalRangeChange(handleRangeChange);
		};
	});

	// apply series options (re-applies when they change)
	$effect(() => {
		if (series && options) {
			series.applyOptions(options);
		}
	});

	// call callback (on initial load and whenever callback is updated)
	$effect(() => {
		if (!callback || !series) return;

		let teardown: ChartCallbackReturnType;

		// use raf to allow series init to complete
		const rafId = requestAnimationFrame(() => {
			if (series) {
				teardown = callback({ chart, colors, series });
			}
		});

		return () => {
			cancelAnimationFrame(rafId);
			teardown?.();
		};
	});

	// apply default priceScale options and any custom ones provided as prop
	$effect(() => {
		series?.priceScale().applyOptions({
			borderColor: colors.axisBorder,
			...priceScaleOptions
		});
	});

	// apply priceScaleCalculator if one was provided
	$effect(() => {
		if (series && priceScaleCalculator) {
			series.applyOptions({
				autoscaleInfoProvider: () => priceScaleCalculator(getVisibleData())
			});
		}
	});

	// Get currently visible chart data segment
	function getVisibleData(): TvDataItem[] {
		if (!series || !visibleLogicalRange) return [];

		const data = series.data() as TvDataItem[];
		const { from, to } = visibleLogicalRange;

		const barsInfo = series.barsInLogicalRange({ from, to });
		if (!barsInfo) return [];

		const startIndex = data.findIndex((c) => c.time === barsInfo?.from);
		const endIndex = data.findIndex((c) => c.time === barsInfo?.to);
		return data.slice(startIndex, endIndex + 1);
	}

	function handleRangeChange(range: LogicalRange | null) {
		visibleLogicalRange = range;

		if (dataFeed?.hasMoreData && range && range.from < LOGICAL_RANGE_THRESHOLD) {
			dataFeed.fetchData();
		}

		onVisibleDataChange?.(getVisibleData());
	}

	// fetch initial data whenever a new dataFeed is provided
	$effect(() => {
		// prevent effect from triggering itself
		if (dataFeed) {
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
		series?.setData(data ?? dataFeed!.data);
	});

	// mount/unmount SeriesContent to inject children into the series pane element
	$effect(() => {
		if (!children || !series) return;

		let seriesContent: ReturnType<typeof mount> | undefined;

		// Use raf allow chart.addSeries to complete
		const rafId = requestAnimationFrame(() => {
			const target = series?.getPane().getHTMLElement()?.querySelector('td:nth-child(2)');
			if (target) {
				seriesContent = mount(SeriesContent, { target, props: { children } });
			}
		});

		return () => {
			cancelAnimationFrame(rafId);
			if (seriesContent) {
				unmount(seriesContent);
			}
		};
	});
</script>
