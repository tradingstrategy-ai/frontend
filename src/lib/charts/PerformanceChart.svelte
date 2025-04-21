<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import type { AreaSeriesPartialOptions, DeepPartial, PriceScaleOptions } from 'lightweight-charts';
	import type { SimpleDataItem, TimeSpan } from './types';
	import type { ProfitInfo } from '$lib/components/Profitability.svelte';
	import TvChart from './TvChart.svelte';
	import BaselineSeries from './BaselineSeries.svelte';
	import AreaSeries from './AreaSeries.svelte';

	type Props = ComponentProps<typeof TvChart> & {
		timeSpan: TimeSpan;
		periodPerformance: Maybe<ProfitInfo>;
		data: SimpleDataItem[];
		visibleRange: Maybe<[Date, Date]>;
	};

	let { timeSpan, periodPerformance, data, visibleRange, children, ...restProps }: Props = $props();

	const seriesOptions: AreaSeriesPartialOptions = {
		priceLineVisible: false,
		crosshairMarkerVisible: false
	};

	const priceScaleOptions: DeepPartial<PriceScaleOptions> = {
		scaleMargins: { top: 0.1, bottom: 0.1 }
	};
</script>

<TvChart {...restProps}>
	<AreaSeries {data} direction={periodPerformance?.direction} options={seriesOptions} {priceScaleOptions} />

	{@render children?.()}

	{#if visibleRange}
		<BaselineSeries interval={timeSpan.interval} range={visibleRange} setChartVisibleRange />
	{/if}
</TvChart>
