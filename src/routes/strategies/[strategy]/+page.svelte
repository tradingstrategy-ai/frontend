<script lang="ts">
	import type { CIQ } from 'chartiq/js/standard';
	import type { ComponentEvents } from 'svelte';
	import {
		type Candle,
		ChartContainer,
		PerformanceChart,
		normalizeDataForInterval,
		periodicityToTimeBucket
	} from '$lib/chart';
	import { getChartClient } from 'trade-executor/chart';
	import { MyDeposits } from '$lib/wallet';
	import { UpDownCell } from '$lib/components';
	import SummaryMetrics from './SummaryMetrics.svelte';
	import { formatPercent } from '$lib/helpers/formatters';
	import { formatProfitability } from 'trade-executor/helpers/formatters';
	import { relativeProfitability } from 'trade-executor/helpers/profit';
	import { isGeoBlocked } from '$lib/helpers/geo';
	import { fetchPublicApi } from '$lib/helpers/public-api';
	import { getBenchmarkTokens } from 'trade-executor/helpers/benchmarks';

	export let data;
	const { chain, strategy, admin, ipCountry } = data;

	const backtestLink = `/strategies/${strategy.id}/backtest`;
	const keyMetrics = strategy.summary_statistics.key_metrics;
	const geoBlocked = !admin && isGeoBlocked('strategies:deposit', ipCountry);

	let periodPerformance: MaybeNumber;

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

	function dateUrlParam(date: Date): string {
		return date.toISOString().slice(0, 19);
	}

	const benchmarkTokens = getBenchmarkTokens(strategy);
	let selectedBenchmarks = benchmarkTokens.map((t) => t.symbol);
	let benchmarksUpdating = false;

	async function updateBenchmarks(chartEngine: CIQ.ChartEngine) {
		const periodicity = chartEngine.getPeriodicity();
		const time_bucket = periodicityToTimeBucket(periodicity)!;

		const dataSegment = chartEngine.getDataSegment();
		const first = chartEngine.getFirstLastDataRecord(dataSegment, 'Close');
		const last = chartEngine.getFirstLastDataRecord(dataSegment, 'Close', true);

		if (!first || !last) return;

		const urlParams = {
			pair_ids: benchmarkTokens.map((t) => t.pairId).join(','),
			exchange_type: 'uniswap_v3',
			time_bucket,
			start: dateUrlParam(first.DT),
			end: dateUrlParam(last.DT)
		};

		const benchmarkData = await fetchPublicApi(fetch, 'candles', urlParams);

		for (const token of benchmarkTokens) {
			// remove benchmark series if it exists
			chartEngine.removeSeries(token.symbol);

			// if benchmark not selected, continue to next
			if (!selectedBenchmarks.includes(token.symbol)) continue;

			const tokenData = benchmarkData[token.pairId];
			const c0 = tokenData[0].c;

			const quotes = tokenData.map(({ ts, c }: Candle) => ({
				DT: `${ts}Z`,
				Close: (c - c0) / c0 + first.Close
			}));

			chartEngine.addSeries(token.symbol, {
				shareYAxis: true,
				data: quotes,
				color: token.color,
				opacity: 0.5,
				overChart: false,
				fillGaps: true
			});
		}
	}

	function init(chartEngine: any) {
		// disable series highlighting on-hover
		chartEngine.findHighlights = () => {};

		return async () => {
			benchmarksUpdating = true;
			await updateBenchmarks(chartEngine);
			benchmarksUpdating = false;
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
				{#if periodPerformance !== undefined}
					<UpDownCell value={periodPerformance} formatter={formatProfitability} />
					{performanceLabel}
				{/if}
			</div>

			<PerformanceChart
				options={chartOptions}
				loading={$chartClient.loading || benchmarksUpdating}
				data={normalizeDataForInterval($chartClient.data ?? [], interval)}
				formatValue={formatPercent}
				{spanDays}
				{init}
				invalidate={[selectedBenchmarks]}
				on:change={(e) => (periodPerformance = getPeriodPerformance(e.detail, spanDays))}
			/>

			<footer slot="footer">
				{#each benchmarkTokens as { symbol, color }}
					<label style:color>
						<input type="checkbox" name="benchmarks" value={symbol} bind:group={selectedBenchmarks} />
						{symbol}
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

		footer {
			margin-top: 0.5rem;
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
		}
	}
</style>
