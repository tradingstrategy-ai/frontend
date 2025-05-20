<script lang="ts">
	import type { ComponentProps, Snippet } from 'svelte';
	import type { AreaSeriesPartialOptions, DeepPartial, PriceScaleOptions } from 'lightweight-charts';
	import type { SimpleDataItem, TimeSpan, TvChartOptions, TvDataItem } from './types';
	import { OptionGroup } from '$lib/helpers/option-group.svelte';
	import { TimeSpans } from '$lib/charts/time-span';
	import SegmentedControl from '$lib/components/SegmentedControl.svelte';
	import TvChart from './TvChart.svelte';
	import AreaSeries from './AreaSeries.svelte';
	import BaselineSeries from './BaselineSeries.svelte';
	import ChartTooltip from './ChartTooltip.svelte';
	import Timestamp from '$lib/components/Timestamp.svelte';
	import { type ProfitInfo, getProfitInfo } from '$lib/components/Profitability.svelte';
	import { getDataRange, normalizeDataForInterval } from './helpers';
	import { relativeReturn } from '$lib/helpers/financial';
	import { merge } from '$lib/helpers/object';

	type Props = ComponentProps<typeof TvChart> & {
		data: [number, number][] | undefined;
		formatValue: Formatter<number>;
		title?: Snippet<[TimeSpan, ProfitInfo]> | string;
		subtitle?: Snippet;
		series?: Snippet<[SimpleDataItem[], TimeSpan, [Date, Date]]>;
		footer?: Snippet;
	};

	let { data, formatValue, options, title, subtitle, series, footer, ...restProps }: Props = $props();

	const timeSpans = new OptionGroup(TimeSpans.keys, '3M');

	let timeSpan = $derived(TimeSpans.get(timeSpans.selected));

	let normalizedData = $derived(normalizeDataForInterval(data ?? [], timeSpan.interval));

	let timeSpanRange = $derived(getDataRange(normalizedData, timeSpan));

	let visibleData: SimpleDataItem[] = $state([]);

	let periodPerformance = $derived(getProfitInfo(relativeReturn(visibleData[0]?.value, visibleData.at(-1)?.value)));

	const chartOptions: TvChartOptions = {
		crosshair: { vertLine: { visible: true } },
		localization: { priceFormatter: formatValue },
		timeScale: {
			lockVisibleTimeRangeOnResize: true
		}
	};

	const seriesOptions: AreaSeriesPartialOptions = {
		priceLineVisible: false,
		crosshairMarkerVisible: false
	};

	const priceScaleOptions: DeepPartial<PriceScaleOptions> = {
		scaleMargins: { top: 0.1, bottom: 0.1 }
	};
</script>

<div class="chart-container" data-css-props>
	<header>
		{#if typeof title === 'string'}
			<h2>{title}</h2>
		{:else}
			<div>{@render title?.(timeSpan, periodPerformance)}</div>
		{/if}
		<SegmentedControl secondary options={timeSpans.options} bind:selected={timeSpans.selected} />
		<p>{@render subtitle?.()}</p>
	</header>

	<TvChart options={merge({ ...chartOptions }, options)} {...restProps}>
		<AreaSeries
			data={normalizedData}
			direction={periodPerformance?.direction}
			options={seriesOptions}
			{priceScaleOptions}
			onVisibleDataChange={(data) => (visibleData = data as SimpleDataItem[])}
		/>

		{#if timeSpanRange}
			{@render series?.(normalizedData, timeSpan, timeSpanRange)}
		{/if}

		{#if timeSpanRange}
			<BaselineSeries interval={timeSpan.interval} range={timeSpanRange} setChartVisibleRange />
		{/if}

		{#snippet tooltip({ point, time }, [performance])}
			{#if performance}
				{@const withTime = timeSpan.timeBucket !== '1d'}
				<ChartTooltip {point}>
					<h4><Timestamp date={time as number} {withTime} /></h4>
					<div class="tooltip-value">{formatValue(performance.value, 2)}</div>
				</ChartTooltip>
			{/if}
		{/snippet}
	</TvChart>

	{@render footer?.()}
</div>

<style>
	[data-css-props] {
		--chart-container-padding: 1.5rem;

		@media (--viewport-md-down) {
			--chart-container-padding: 1rem;
		}
	}

	.chart-container {
		:global([data-css-props]) {
			--chart-aspect-ratio: 2;

			@media (--viewport-sm-down) {
				--chart-aspect-ratio: 1.75;
			}

			@media (--viewport-xs) {
				--chart-aspect-ratio: 1.25;
			}
		}

		:global([data-css-props]) {
			@media (--viewport-xs) {
				--segmented-control-font: var(--f-ui-xs-medium);
				--segmented-control-letter-spacing: var(--ls-ui-xs);
			}
		}

		display: grid;
		gap: var(--space-sm);
		background: var(--c-box-1);
		border: 1px solid var(--c-box-3);
		border-radius: var(--radius-md);
		padding-block: var(--chart-container-padding);

		header {
			display: grid;
			grid-template-columns: 1fr auto;
			align-items: center;
			gap: var(--space-sm);
			padding-inline: var(--chart-container-padding);

			h2 {
				font: var(--f-heading-md-medium);
				letter-spacing: var(--f-heading-md-spacing, normal);
			}

			p {
				grid-column: 1 / -1;
				font: var(--f-ui-md-roman);
				letter-spacing: var(ls-ui-md);

				@media (--viewport-xs) {
					font: var(--f-ui-sm-roman);
					letter-spacing: var(ls-ui-sm);
				}
			}
		}

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
	}
</style>
