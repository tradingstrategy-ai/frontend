<script lang="ts">
	import type { ConnectedStrategyInfo } from 'trade-executor/models/strategy-info';
	import type { CIQ } from 'chartiq/js/standard';
	import type { Candle, Quote, QuoteFeed } from '$lib/chart';
	import {
		quoteFeed,
		normalizeDataForInterval,
		periodicityToTimeBucket,
		ChartContainer,
		PerformanceChart
	} from '$lib/chart';
	import { getChartClient } from 'trade-executor/chart';
	import { type BenchmarkToken, getBenchmarkTokens } from 'trade-executor/helpers/benchmarks';
	import { differenceInCalendarDays } from 'date-fns';
	import { UpDownCell } from '$lib/components';
	import { formatPercent, formatProfitability } from '$lib/helpers/formatters';

	type Props = {
		strategy: ConnectedStrategyInfo;
	};

	let { strategy }: Props = $props();

	const chartClient = getChartClient(fetch, strategy.url);

	const periodPerformance: Record<string, MaybeNumber> = $state({});

	const benchmarkTokens = getBenchmarkTokens(strategy);
	let selectedBenchmarks = $state(benchmarkTokens.map((t) => t.symbol));
	let benchmarksUpdating = $state(0);

	let loading = $derived($chartClient.loading || benchmarksUpdating > 0);

	let initialTimeframe = $derived.by(() => {
		const firstTs = $chartClient.data?.[0]?.[0] as number | undefined;
		if (firstTs === undefined) return '3M';
		const age = differenceInCalendarDays(new Date(), firstTs * 1000);
		return age <= 7 ? '1W' : age <= 30 ? '1M' : '3M';
	});

	chartClient.fetch({
		type: 'compounding_unrealised_trading_profitability_sampled',
		source: 'live_trading'
	});

	function updateBenchmark(chartEngine: CIQ.ChartEngine, feed: QuoteFeed, token: BenchmarkToken) {
		// remove benchmark series if it exists
		chartEngine.removeSeries(token.symbol);

		// clear benchmark period performance and abort if benchmark not selected
		if (!selectedBenchmarks.includes(token.symbol)) {
			periodPerformance[token.symbol] = undefined;
			return;
		}

		benchmarksUpdating++;

		const periodicity = chartEngine.getPeriodicity();
		const timeBucket = periodicityToTimeBucket(periodicity)!;

		const symbolObject = {
			symbol: token.symbol,
			urlParams: { pair_id: token.pairId, exchange_type: 'uniswap_v3', time_bucket: timeBucket }
		};

		chartEngine.attachQuoteFeed(feed, {});

		chartEngine.addSeries(
			token.symbol,
			{
				symbolObject,
				shareYAxis: true,
				color: token.color,
				opacity: 0.5,
				overChart: false,
				fillGaps: true
			},
			(_: any, { lastQuote }: { lastQuote?: Quote }) => {
				benchmarksUpdating--;

				// update benchmark period performance
				if (lastQuote) {
					periodPerformance[token.symbol] = lastQuote?.percentChange;
				}
			}
		);

		chartEngine.detachQuoteFeed(feed);
	}

	function init(chartEngine: any) {
		// disable series highlighting on-hover
		chartEngine.findHighlights = () => {};

		// create quote feed to be used for updating benchmarks
		const feed = quoteFeed('candles', { candle_type: 'price' }, (data: Record<string, Candle[]>) => {
			const dataSegment = chartEngine.getDataSegment();
			const first = chartEngine.getFirstLastDataRecord(dataSegment, 'Close')!;
			const last = chartEngine.getFirstLastDataRecord(dataSegment, 'Close', true)!;

			let candles = Object.values(data)[0] ?? [];

			// filter candles to match date range of strategy series
			candles = candles.filter(({ ts }) => {
				const d = new Date(`${ts}Z`);
				return d >= first.DT && d <= last.DT;
			});

			const initialValue = candles[0]?.c ?? 0;

			return candles.map(({ ts, c }: Candle) => {
				const percentChange = (c - initialValue) / initialValue;
				return {
					DT: `${ts}Z`,
					percentChange: percentChange,
					Close: percentChange + first.Close
				};
			});
		});

		return () => {
			if ($chartClient.loading) return;
			benchmarksUpdating = 0;
			benchmarkTokens.forEach((token) => updateBenchmark(chartEngine, feed, token));
		};
	}

	const chartOptions = {
		controls: { home: null },
		allowScroll: false,
		allowZoom: false,
		xaxisHeight: 20,
		chart: {
			xAxis: { displayBorder: false, fitLeftToRight: true },
			yAxis: { noDraw: true }
		}
	};
</script>

<div class="strategy-performance-chart">
	<ChartContainer selected={initialTimeframe} let:timeSpan={{ spanDays, interval }}>
		<div class="period-performance" slot="title" let:timeSpan={{ performanceLabel }}>
			{#if periodPerformance[strategy.id] !== undefined}
				<UpDownCell value={periodPerformance[strategy.id]} formatter={formatProfitability} />
				{performanceLabel}
			{/if}
		</div>

		<PerformanceChart
			options={chartOptions}
			{loading}
			data={normalizeDataForInterval($chartClient.data ?? [], interval)}
			formatValue={formatPercent}
			{spanDays}
			{init}
			invalidate={[selectedBenchmarks]}
			onPeriodPerformanceChange={(value) => (periodPerformance[strategy.id] = value)}
		/>

		<footer class="benchmark-tokens" slot="footer">
			{#each benchmarkTokens as { symbol, color }}
				<label style:color>
					<input type="checkbox" name="benchmarks" value={symbol} bind:group={selectedBenchmarks} />
					{symbol}
					<span class="performance" class:skeleton={loading && selectedBenchmarks.includes(symbol)}>
						{formatPercent(periodPerformance[symbol], 1, 1, { signDisplay: 'exceptZero' })}
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

		:global(.stx_xaxis) {
			color: transparent;
		}

		:global(.stx_xaxis_dark) {
			color: var(--c-text-extra-light);
		}
	}

	.period-performance {
		:global([data-css-props]) {
			--up-down-font: var(--f-ui-lg-medium);
			--up-down-letter-spacing: var(--ls-ui-lg);

			@media (--viewport-md-down) {
				--up-down-font: var(--f-ui-md-medium);
				--up-down-letter-spacing: var(--ls-ui-md);
			}
		}

		display: flex;
		gap: 1em;
		align-items: center;
		font: var(--f-ui-sm-medium);
		letter-spacing: var(--ls-ui-sm);
		color: var(--c-text-extra-light);
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
</style>
