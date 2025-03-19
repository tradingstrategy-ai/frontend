<script lang="ts">
	import type { LogicalRange, SeriesDefinition, SeriesType } from 'lightweight-charts';
	import type { CandleDataFeed } from './candle-data-feed.svelte';
	import { onMount } from 'svelte';
	import { getChartContext } from './TvChart.svelte';

	const LOGICAL_RANGE_THRESHOLD = 50;

	type Props = {
		type: SeriesDefinition<SeriesType>;
		dataFeed: CandleDataFeed;
	};

	let { type, dataFeed }: Props = $props();

	const getChart = getChartContext();

	let chart = $derived(getChart());
	let series = $derived(chart?.addSeries(type));

	function handleRangeChange(logicalRange: LogicalRange | null) {
		if (logicalRange === null) return;
		const { to, from } = logicalRange;
		if (from < LOGICAL_RANGE_THRESHOLD) {
			const ticksVisible = Math.round(to - from) + 1;
			dataFeed.fetchData(ticksVisible * 2);
		}
	}

	// fetch initial series data
	onMount(() => {
		dataFeed.fetchData();
	});

	// update series when data changes
	$effect(() => {
		series?.setData(dataFeed.data);
	});

	// subscribe range changes (due to pan/zoom interactions)
	$effect(() => {
		chart?.timeScale().subscribeVisibleLogicalRangeChange(handleRangeChange);
		return () => {
			chart?.timeScale().unsubscribeVisibleLogicalRangeChange(handleRangeChange);
		};
	});
</script>
