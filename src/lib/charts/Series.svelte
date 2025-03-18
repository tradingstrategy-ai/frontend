<script lang="ts">
	import { getChartContext } from './TvChart.svelte';

	import { type SeriesDefinition, type SeriesType } from 'lightweight-charts';

	type Props = {
		type: SeriesDefinition<SeriesType>;
		data: any[];
	};

	let { type, data }: Props = $props();

	const getChart = getChartContext();

	let series = $derived(getChart()?.addSeries(type));

	$effect(() => {
		series?.setData(data);
	});
</script>
