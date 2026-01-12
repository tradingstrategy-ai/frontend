<script lang="ts">
	import type { ComponentProps, Snippet } from 'svelte';
	import type { SimpleDataItem, TimeSpan, TvChartOptions, TvDataItem } from './types';
	import { OptionGroup } from '$lib/helpers/option-group.svelte';
	import { TimeSpans, type TimeSpanKey } from '$lib/charts/time-span';
	import SegmentedControl from '$lib/components/SegmentedControl.svelte';
	import TvChart, { type ActiveTooltipParams, type TooltipData } from './TvChart.svelte';
	import BaselineSeries from './BaselineSeries.svelte';
	import ChartTooltip from './ChartTooltip.svelte';
	import Timestamp from '$lib/components/Timestamp.svelte';
	import { getDataRange, resampleTimeSeries } from './helpers';
	import { merge } from '$lib/helpers/object';

	interface SeriesSnippetOptions {
		data: SimpleDataItem[];
		timeSpan: TimeSpan;
		range: [Date, Date] | undefined;
	}

	interface Props extends ComponentProps<typeof TvChart> {
		data: [number, number][] | undefined;
		formatValue: Formatter<number>;
		boxed?: boolean;
		timeSpanOptions?: TimeSpanKey[];
		title?: Snippet<[TimeSpan]> | string;
		subtitle?: Snippet | string;
		series: Snippet<[SeriesSnippetOptions]>;
		footer?: Snippet;
	}

	let {
		data,
		formatValue,
		boxed = false,
		timeSpanOptions = TimeSpans.keys,
		options,
		title,
		subtitle,
		series,
		tooltip,
		footer,
		...restProps
	}: Props = $props();

	// svelte-ignore state_referenced_locally
	const timeSpans = new OptionGroup(timeSpanOptions, '3M');

	let timeSpan = $derived(TimeSpans.get(timeSpans.selected));

	let resampledData = $derived(resampleTimeSeries(data ?? [], timeSpan.interval));

	let range = $derived(getDataRange(resampledData, timeSpan));

	const chartOptions: TvChartOptions = {
		crosshair: { vertLine: { visible: true } },
		localization: {
			priceFormatter: (v: number) => formatValue(v)
		},
		timeScale: {
			lockVisibleTimeRangeOnResize: true
		}
	};
</script>

<div class={['chart-container', boxed && 'boxed']} data-css-props>
	<header>
		{#if typeof title === 'string'}
			<h2>{title}</h2>
		{:else}
			<div>{@render title?.(timeSpan)}</div>
		{/if}
		<SegmentedControl secondary options={timeSpans.options} bind:selected={timeSpans.selected} />
		<p>
			{#if typeof subtitle === 'string'}
				{subtitle}
			{:else}
				{@render subtitle?.()}
			{/if}
		</p>
	</header>

	{#snippet defaultTooltip({ point, time }: ActiveTooltipParams, [performance]: TooltipData)}
		{#if performance}
			{@const withTime = timeSpan.timeBucket !== '1d'}
			<ChartTooltip {point}>
				<h4><Timestamp date={time as number} {withTime} /></h4>
				<div class="tooltip-value">{formatValue(performance.value, 2)}</div>
			</ChartTooltip>
		{/if}
	{/snippet}

	<TvChart options={merge({ ...chartOptions }, options)} {...restProps} tooltip={tooltip ?? defaultTooltip}>
		{@render series({
			data: resampledData,
			timeSpan,
			range
		})}

		{#if range}
			<BaselineSeries interval={timeSpan.interval} {range} setChartVisibleRange />
		{/if}
	</TvChart>

	{@render footer?.()}
</div>

<style>
	[data-css-props] {
		--chart-container-padding: 0;

		&:where(.boxed) {
			--chart-container-padding: 1.5rem;

			@media (--viewport-md-down) {
				--chart-container-padding: 1rem;
			}
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
		gap: 0.25rem;
		padding-block: var(--chart-container-padding);

		&.boxed {
			background: var(--c-box-1);
			border: 1px solid var(--c-box-3);
			border-radius: var(--radius-md);
		}

		header {
			display: grid;
			grid-template-columns: 1fr auto;
			align-items: center;
			gap: inherit;
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
