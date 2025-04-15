<script lang="ts">
	import type { TvChartOptions } from '$lib/charts/types';
	import type { ConnectedStrategyInfo } from 'trade-executor/models/strategy-info';
	import { type TimeInterval, utcDay, utcHour } from 'd3-time';
	import { type AreaSeriesPartialOptions, type UTCTimestamp, LineType, TickMarkType } from 'lightweight-charts';
	import { OptionGroup } from '$lib/helpers/option-group.svelte';
	import ChartContainer from '$lib/charts/ChartContainer.svelte';
	import Profitability, { getProfitInfo } from '$lib/components/Profitability.svelte';
	import TvChart, { type ChartColors } from '$lib/charts/TvChart.svelte';
	import AreaSeries from '$lib/charts/AreaSeries.svelte';
	import BaselineSeries from '$lib/charts/BaselineSeries.svelte';
	import { getChartClient } from 'trade-executor/client/chart';
	import { normalizeDataForInterval, formatMonthYear, tsToDate, dateToTs } from '$lib/charts/helpers';
	import { relativeProfitability } from '$lib/helpers/profit';

	type Props = {
		strategy: ConnectedStrategyInfo;
	};

	let { strategy }: Props = $props();

	type TimeSpan = {
		performanceLabel: string;
		spanDays?: number;
		interval: TimeInterval;
	};

	const timeSpanInfo: Record<string, TimeSpan> = {
		'1W': {
			performanceLabel: 'past week',
			spanDays: 7,
			interval: utcHour
		},
		'1M': {
			performanceLabel: 'past month',
			spanDays: 30,
			interval: utcHour.every(4)!
		},
		'3M': {
			performanceLabel: 'past 90 days',
			spanDays: 90,
			interval: utcDay
		},
		Max: {
			performanceLabel: 'lifetime',
			interval: utcDay
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

	// fetch chart data (initial load or if chartClient is updated)
	$effect(() => {
		chartClient.fetch({
			type: 'compounding_unrealised_trading_profitability_sampled',
			source: 'live_trading'
		});
	});

	function chartOptions(colors: ChartColors): TvChartOptions {
		return {
			rightPriceScale: { visible: false },
			layout: { textColor: colors.textExtraLight },
			timeScale: {
				borderVisible: false,
				lockVisibleTimeRangeOnResize: true,
				tickMarkFormatter: (ts: UTCTimestamp, type: TickMarkType) => {
					return type === TickMarkType.Month ? formatMonthYear(ts) : '';
				}
			}
		};
	}

	const seriesOptions: AreaSeriesPartialOptions = {
		lineType: LineType.Curved,
		priceLineVisible: false
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

			{#if visibleRange}
				<BaselineSeries interval={timeSpan.interval} range={visibleRange} setChartVisibleRange />
			{/if}
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
	}
</style>
