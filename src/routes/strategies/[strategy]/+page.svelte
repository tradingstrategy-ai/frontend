<script lang="ts">
	import type { CIQ } from 'chartiq/js/standard';
	import type { ComponentEvents } from 'svelte';
	import {
		type Candle,
		type Quote,
		type QuoteFeed,
		quoteFeed,
		normalizeDataForInterval,
		periodicityToTimeBucket,
		ChartContainer,
		PerformanceChart
	} from '$lib/chart';
	import { getChartClient } from 'trade-executor/chart';
	import { MyDeposits } from '$lib/wallet';
	import { UpDownCell } from '$lib/components';
	import SummaryMetrics from './SummaryMetrics.svelte';
	import { formatPercent } from '$lib/helpers/formatters';
	import { formatProfitability } from 'trade-executor/helpers/formatters';
	import { relativeProfitability } from 'trade-executor/helpers/profit';
	import { isGeoBlocked } from '$lib/helpers/geo';
	import { type BenchmarkToken, getBenchmarkTokens } from 'trade-executor/helpers/benchmarks';

	export let data;
	const { chain, strategy, admin, ipCountry } = data;

	const backtestLink = `/strategies/${strategy.id}/backtest`;
	const keyMetrics = strategy.summary_statistics.key_metrics;
	const geoBlocked = !admin && isGeoBlocked('strategies:deposit', ipCountry);

	const periodPerformance: Record<string, MaybeNumber> = {};

	type ChartChangeDetail = ComponentEvents<PerformanceChart>['change']['detail'];

	function getPeriodPerformance({ first, last, firstTickPosition }: ChartChangeDetail, spanDays: MaybeNumber) {
		if (!first) return undefined;

		let initialValue = first.Close;

		// if max timeframe OR first tick is after start of displayed chart window
		// use initial value of 0 instead of first quote value (since chart data does
		// not always start at 0)
		if (!spanDays || firstTickPosition > 0) {
			initialValue = 0;
		}

		return relativeProfitability(initialValue, last?.Close);
	}

	const chartClient = getChartClient(fetch, strategy.url);

	chartClient.fetch({
		type: 'compounding_unrealised_trading_profitability_sampled',
		source: 'live_trading'
	});

	const benchmarkTokens = getBenchmarkTokens(strategy);
	let selectedBenchmarks = benchmarkTokens.map((t) => t.symbol);
	let benchmarksUpdating = 0;

	$: loading = $chartClient.loading || benchmarksUpdating > 0;

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

			const initialValue = candles[0].c;

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

<svelte:head>
	<title>{strategy.name} | Trading Strategy</title>
	<meta name="description" content={strategy.short_description} />
</svelte:head>

<div class="strategy-overview-page">
	<MyDeposits {strategy} {chain} {geoBlocked} {ipCountry} />

	<div class="chart">
		<ChartContainer let:timeSpan={{ spanDays, interval }}>
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
				on:change={(e) => (periodPerformance[strategy.id] = getPeriodPerformance(e.detail, spanDays))}
			/>

			<footer class="benchmark-tokens" slot="footer">
				{#each benchmarkTokens as { symbol, color }}
					<label style:color>
						<input type="checkbox" name="benchmarks" value={symbol} bind:group={selectedBenchmarks} />
						{symbol}
						<span class="performance" class:skeleton={loading && selectedBenchmarks.includes(symbol)}>
							{formatProfitability(periodPerformance[symbol])}
						</span>
					</label>
				{/each}
			</footer>
		</ChartContainer>
	</div>

	<SummaryMetrics {keyMetrics} {backtestLink} />
</div>

<style lang="postcss">
	.strategy-overview-page {
		display: grid;
		gap: 1rem;
		align-items: flex-start;

		/* Desktop 2 column layout */
		@media (--viewport-md-up) {
			gap: 1.5rem;
			grid-template-columns: 2fr minmax(17rem, 1fr);

			/* move deposit widget (1st element) to row 2, col 2 */
			> :global(:nth-child(1)) {
				grid-area: 2 / 2;
			}

			/* chart and description (2nd & 4th elements) span full row width */
			> :global(:nth-child(2n)) {
				grid-column: 1 / -1;
			}
		}

		.chart {
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
	}
</style>
