<script lang="ts">
	import type { CandleTimeBucket, SimpleDataItem, TvChartOptions } from '$lib/charts/types';
	import type { ConnectedStrategyInfo } from 'trade-executor/models/strategy-info';
	import type { AreaSeriesPartialOptions, TickMarkFormatter, UTCTimestamp } from 'lightweight-charts';
	import { type TimeInterval, utcDay, utcHour } from 'd3-time';
	import { LineType, TickMarkType } from 'lightweight-charts';
	import { OptionGroup } from '$lib/helpers/option-group.svelte';
	import ChartContainer from '$lib/charts/ChartContainer.svelte';
	import Profitability, { getProfitInfo } from '$lib/components/Profitability.svelte';
	import TvChart, { type ChartColors } from '$lib/charts/TvChart.svelte';
	import AreaSeries from '$lib/charts/AreaSeries.svelte';
	import BaselineSeries from '$lib/charts/BaselineSeries.svelte';
	import ChartTooltip from '$lib/charts/ChartTooltip.svelte';
	import Timestamp from '$lib/components/Timestamp.svelte';
	import { getChartClient } from 'trade-executor/client/chart';
	import { getBenchmarkTokens } from 'trade-executor/helpers/benchmarks';
	import { normalizeDataForInterval, formatMonthYear, tsToDate, dateToTs } from '$lib/charts/helpers';
	import { relativeProfitability } from '$lib/helpers/profit';
	import { formatPercent } from '$lib/helpers/formatters';
	import BenchmarkSeries from '$lib/charts/BenchmarkSeries.svelte';

	type Props = {
		strategy: ConnectedStrategyInfo;
	};

	let { strategy }: Props = $props();

	type TimeSpan = {
		performanceLabel: string;
		spanDays?: number;
		interval: TimeInterval;
		timeBucket: CandleTimeBucket;
	};

	const timeSpanInfo: Record<string, TimeSpan> = {
		'1W': {
			performanceLabel: 'past week',
			spanDays: 7,
			interval: utcHour,
			timeBucket: '1h'
		},
		'1M': {
			performanceLabel: 'past month',
			spanDays: 30,
			interval: utcHour.every(4)!,
			timeBucket: '4h'
		},
		'3M': {
			performanceLabel: 'past 90 days',
			spanDays: 90,
			interval: utcDay,
			timeBucket: '1d'
		},
		Max: {
			performanceLabel: 'lifetime',
			interval: utcDay,
			timeBucket: '1d'
		}
	} as const;

	const timeSpans = new OptionGroup(Object.keys(timeSpanInfo), '3M');

	let timeSpan = $derived(timeSpanInfo[timeSpans.selected]);

	let chartClient = $derived(getChartClient(fetch, strategy.url));

	let data = $derived(normalizeDataForInterval($chartClient.data ?? [], timeSpan.interval));

	let visibleRange = $derived.by(() => {
		if (data.length === 0) return;
		const endDate = tsToDate(data.at(-1)!.time);

		let startDate: Date;
		if (timeSpan.spanDays) {
			startDate = utcDay.offset(endDate, -timeSpan.spanDays);
			startDate = timeSpan.interval.offset(startDate);
		} else {
			startDate = tsToDate(data[0].time);
		}

		return [startDate, endDate] as [Date, Date];
	});

	let firstVisibleDataItem = $derived.by(() => {
		if (!visibleRange) return;
		const startTs = dateToTs(visibleRange[0]);
		return data.findLast(({ time }) => time <= startTs) ?? data[0];
	});

	let periodPerformance = $derived.by(() => {
		if (!visibleRange) return;

		// default startValue = 0 (assume full data range visible)
		let startValue = 0;

		// if full data range not visible, find first value on or before start of visible range
		const startTs = dateToTs(visibleRange[0]);
		if (startTs > data[0].time) {
			startValue = data.findLast(({ time }) => time <= startTs)!.value;
		}

		return getProfitInfo(relativeProfitability(startValue, data.at(-1)?.value));
	});

	let benchmarkTokens = $derived(getBenchmarkTokens(strategy));

	// fetch chart data (initial load or when chartClient is updated)
	$effect(() => {
		chartClient.fetch({
			type: 'compounding_unrealised_trading_profitability_sampled',
			source: 'live_trading'
		});
	});

	let chartOptions = $derived.by(() => {
		// use custom tickMarkFormatter for 3M time span (only show month/year markers)
		const tickMarkFormatter: TickMarkFormatter =
			timeSpans.selected === '3M'
				? (ts, type) => (type <= TickMarkType.Month ? formatMonthYear(ts as UTCTimestamp) : '')
				: () => null;

		return (colors: ChartColors): TvChartOptions => {
			return {
				layout: { textColor: colors.textExtraLight },
				crosshair: { vertLine: { visible: true } },
				rightPriceScale: { visible: false },
				timeScale: {
					borderVisible: false,
					lockVisibleTimeRangeOnResize: true,
					tickMarkFormatter
				}
			};
		};
	});

	const seriesOptions: AreaSeriesPartialOptions = {
		lineType: LineType.Curved,
		priceLineVisible: false,
		crosshairMarkerVisible: false
	};

	const priceScaleOptions = {
		scaleMargins: { top: 0.1, bottom: 0.1 }
	};
</script>

<div class="strategy-performance-chart">
	<ChartContainer {timeSpans}>
		{#snippet title()}
			<div class="period-performance">
				{#if periodPerformance !== undefined}
					<Profitability of={periodPerformance.value} boxed />
					<span class="performance-label">{timeSpan.performanceLabel}</span>
				{/if}
			</div>
		{/snippet}

		<TvChart loading={$chartClient.loading} options={chartOptions}>
			<AreaSeries {data} direction={periodPerformance?.direction} options={seriesOptions} {priceScaleOptions} />

			{#if visibleRange && firstVisibleDataItem}
				{#each benchmarkTokens as token}
					<BenchmarkSeries
						{token}
						timeBucket={timeSpan.timeBucket}
						firstDataItem={firstVisibleDataItem}
						endDate={visibleRange[1]}
					/>
				{/each}
			{/if}

			{#if visibleRange}
				<BaselineSeries interval={timeSpan.interval} range={visibleRange} setChartVisibleRange />
			{/if}

			{#snippet tooltip({ point, time }, [performance])}
				{#if performance}
					{@const withTime = ['1W', '1M'].includes(timeSpans.selected)}
					{@const previous = performance.customValues?.previous as SimpleDataItem | undefined}
					{@const value = performance.value ?? previous?.value}
					<ChartTooltip {point}>
						<h4><Timestamp date={time as number} {withTime} /></h4>
						<div class="tooltip-value">{formatPercent(value, 2)}</div>
					</ChartTooltip>
				{/if}
			{/snippet}
		</TvChart>
	</ChartContainer>
</div>

<style>
	.strategy-performance-chart {
		:global([data-css-props]) {
			--chart-aspect-ratio: 3.25;

			@media (--viewport-sm-down) {
				--chart-aspect-ratio: 2.25;
			}

			@media (--viewport-xs) {
				--chart-aspect-ratio: 1.75;
			}
		}

		.period-performance {
			display: flex;
			gap: 1em;
			align-items: center;
			font: var(--f-ui-lg-medium);
			letter-spacing: var(--ls-ui-lg);

			@media (--viewport-md-down) {
				font: var(--f-ui-md-medium);
				letter-spacing: var(--ls-ui-md);
			}

			.performance-label {
				font: var(--f-ui-sm-medium);
				letter-spacing: var(--ls-ui-sm);
				color: var(--c-text-extra-light);
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
