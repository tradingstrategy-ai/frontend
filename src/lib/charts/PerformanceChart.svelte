<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import type { AreaSeriesPartialOptions, DeepPartial, PriceScaleOptions } from 'lightweight-charts';
	import type { SimpleDataItem, TimeSpan } from './types';
	import type { ProfitInfo } from '$lib/components/Profitability.svelte';
	import TvChart from './TvChart.svelte';
	import BaselineSeries from './BaselineSeries.svelte';
	import AreaSeries from './AreaSeries.svelte';
	import ChartTooltip from './ChartTooltip.svelte';
	import Timestamp from '$lib/components/Timestamp.svelte';
	import { formatPercent } from '$lib/helpers/formatters';

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

	{#snippet tooltip({ point, time }, [performance])}
		{#if performance}
			{@const withTime = timeSpan.timeBucket !== '1d'}
			<ChartTooltip {point}>
				<h4><Timestamp date={time as number} {withTime} /></h4>
				<div class="tooltip-value">{formatPercent(performance.value, 2)}</div>
			</ChartTooltip>
		{/if}
	{/snippet}
</TvChart>

<style>
	h4 {
		font: var(--f-ui-sm-medium);
		letter-spacing: var(--ls-ui-sm, normal);
		color: var(--c-text-extra-light);
		margin-bottom: 0.25rem;
	}

	.tooltip-value {
		font: var(--f-ui-lg-medium);
		letter-spacing: var(--ls-ui-lg, normal);
		color: var(--c-text);
		text-align: right;
	}
</style>
