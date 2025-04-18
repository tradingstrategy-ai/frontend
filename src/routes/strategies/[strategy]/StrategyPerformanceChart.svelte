<script lang="ts">
	import type { TvChartOptions } from '$lib/charts/types';
	import type { ConnectedStrategyInfo } from 'trade-executor/models/strategy-info';
	import type { AreaSeriesPartialOptions, TickMarkFormatter, UTCTimestamp } from 'lightweight-charts';
	import { TickMarkType } from 'lightweight-charts';
	import { OptionGroup } from '$lib/helpers/option-group.svelte';
	import { TimeSpans } from '$lib/charts/time-span';
	import ChartContainer from '$lib/charts/ChartContainer.svelte';
	import Profitability, { getProfitInfo } from '$lib/components/Profitability.svelte';
	import TvChart, { type ChartColors } from '$lib/charts/TvChart.svelte';
	import AreaSeries from '$lib/charts/AreaSeries.svelte';
	import BaselineSeries from '$lib/charts/BaselineSeries.svelte';
	import BenchmarkSeries from '$lib/charts/BenchmarkSeries.svelte';
	import ChartTooltip from '$lib/charts/ChartTooltip.svelte';
	import Timestamp from '$lib/components/Timestamp.svelte';
	import { getChartClient } from 'trade-executor/client/chart';
	import { getBenchmarkTokens } from 'trade-executor/helpers/benchmark.svelte';
	import { dateToTs, formatMonthYear, getVisibleRange, normalizeDataForInterval } from '$lib/charts/helpers';
	import { relativeProfitability } from '$lib/helpers/profit';
	import { formatPercent } from '$lib/helpers/formatters';

	type Props = {
		strategy: ConnectedStrategyInfo;
	};

	let { strategy }: Props = $props();

	const timeSpans = new OptionGroup(TimeSpans.keys, '3M');
	let timeSpan = $derived(TimeSpans.get(timeSpans.selected));

	let chartClient = $derived(getChartClient(fetch, strategy.url));

	let data = $derived(normalizeDataForInterval($chartClient.data ?? [], timeSpan.interval));

	let visibleRange = $derived(getVisibleRange(data, timeSpan));

	let firstVisibleDataItem = $derived.by(() => {
		if (!visibleRange) return;
		const startTs = dateToTs(visibleRange[0]);
		return data.findLast(({ time }) => time === startTs) ?? data[0];
	});

	let periodPerformance = $derived.by(() => {
		if (!visibleRange || !firstVisibleDataItem) return;
		const startTs = dateToTs(visibleRange[0]);
		const startValue = startTs > data[0].time ? firstVisibleDataItem.value : 0;
		const endValue = data.at(-1)?.value;
		return getProfitInfo(relativeProfitability(startValue, endValue));
	});

	let benchmarkTokens = $derived(getBenchmarkTokens(strategy));

	let loading = $derived($chartClient.loading || benchmarkTokens.some((t) => t.loading));

	let chartOptions = $derived.by(() => {
		// use custom tickMarkFormatter for 3M time span (only show month/year markers)
		const tickMarkFormatter: TickMarkFormatter =
			timeSpans.selected === '3M'
				? (ts, type) => (type <= TickMarkType.Month ? formatMonthYear(ts as UTCTimestamp) : '')
				: () => null;

		return (colors: ChartColors): TvChartOptions => {
			return {
				handleScroll: false,
				handleScale: false,
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
		priceLineVisible: false,
		crosshairMarkerVisible: false
	};

	const priceScaleOptions = {
		scaleMargins: { top: 0.1, bottom: 0.1 }
	};

	// fetch chart data (initial load or when chartClient is updated)
	$effect(() => {
		chartClient.fetch({
			type: 'compounding_unrealised_trading_profitability_sampled',
			source: 'live_trading'
		});
	});
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

		<TvChart {loading} options={chartOptions}>
			<AreaSeries {data} direction={periodPerformance?.direction} options={seriesOptions} {priceScaleOptions} />

			{#if visibleRange && firstVisibleDataItem}
				{#each benchmarkTokens.filter((t) => t.checked) as token (token.symbol)}
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
					<ChartTooltip {point}>
						<h4><Timestamp date={time as number} {withTime} /></h4>
						<div class="tooltip-value">{formatPercent(performance.value, 2)}</div>
					</ChartTooltip>
				{/if}
			{/snippet}
		</TvChart>

		<footer class="benchmark-tokens">
			{#each benchmarkTokens as benchmark}
				<label style:--color={benchmark.color}>
					<input type="checkbox" name="benchmarks" bind:checked={benchmark.checked} />
					{benchmark.symbol}
					<span class="performance" class:skeleton={benchmark.loading}>
						{formatPercent(benchmark.periodPerformance, 1, 1, { signDisplay: 'exceptZero' })}
					</span>
				</label>
			{/each}
		</footer>
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

		.benchmark-tokens {
			margin-top: 0.75rem;
			margin-bottom: -0.25rem;
			display: flex;
			gap: 1rem;
			justify-content: center;

			label {
				display: flex;
				gap: 0.25rem;
				align-items: center;
				font: var(--f-ui-sm-medium);
				letter-spacing: var(--ls-ui-sm);
				color: hsl(from var(--color) h s l / 100%);
			}

			input[type='checkbox'] {
				color: inherit;
				accent-color: currentColor;
			}

			.performance {
				font: var(--f-ui-sm-roman);
				min-width: 4ch;
			}
		}
	}
</style>
