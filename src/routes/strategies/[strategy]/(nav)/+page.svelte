<script lang="ts">
	import { type Quote, ChartContainer, PerformanceChart, normalizeDataForInterval } from '$lib/chart';
	import { MyDeposits } from '$lib/wallet';
	import { UpDownIndicator, UpDownCell } from '$lib/components';
	import SummaryBox from './SummaryBox.svelte';
	import { KeyMetric } from 'trade-executor/components';
	import { formatDaysAgo, formatNumber, formatPercent, formatPrice } from '$lib/helpers/formatters';
	import { formatProfitability } from 'trade-executor/helpers/formatters';
	import { relativeProfitability } from 'trade-executor/helpers/profit';

	export let data;
	$: ({ chain, summary, streamed } = data);

	$: keyMetrics = summary.summary_statistics.key_metrics;
	$: strategyId = summary.id;

	let periodPerformance: MaybeNumber;

	function dataSegmentChange(first: Maybe<Quote>, last: Maybe<Quote>) {
		periodPerformance = relativeProfitability(first?.Close, last?.Close);
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
	<title>{summary.name} | Trading Strategy</title>
	<meta name="description" content={summary.long_description} />
</svelte:head>

<div class="strategy-overview-page">
	<MyDeposits strategy={summary} {chain} />

	<div class="chart">
		<ChartContainer let:timeSpan={{ spanDays, interval, periodicity }}>
			<div class="period-performance" slot="title" let:timeSpan={{ label }}>
				{#if periodPerformance !== undefined}
					<UpDownCell value={periodPerformance} formatter={formatProfitability} />
					Last {label}
				{/if}
			</div>
			<PerformanceChart
				data={streamed.profitabilityChart.then(({ data }) => normalizeDataForInterval(data, interval))}
				options={chartOptions}
				formatValue={formatPercent}
				{spanDays}
				{periodicity}
				{dataSegmentChange}
			/>
		</ChartContainer>
	</div>

	<div class="metrics">
		<SummaryBox title="Summary stats">
			<dl>
				<KeyMetric name="Profitability" metric={keyMetrics.profitability} {strategyId} let:value>
					<UpDownIndicator {value} formatter={formatPercent} />
				</KeyMetric>
				<KeyMetric name="Age" metric={keyMetrics.started_at} formatter={formatDaysAgo} {strategyId} />
				<KeyMetric name="Total assets" metric={keyMetrics.total_equity} formatter={formatPrice} {strategyId} />
			</dl>
		</SummaryBox>

		<SummaryBox title="Risk metrics">
			<dl>
				<KeyMetric name="Sharpe" metric={keyMetrics.sharpe} formatter={formatNumber} {strategyId} />
				<KeyMetric name="Sortino" metric={keyMetrics.sortino} formatter={formatNumber} {strategyId} />
				<KeyMetric name="Max drawdown" metric={keyMetrics.max_drawdown} formatter={formatPercent} {strategyId} />
			</dl>
		</SummaryBox>
	</div>

	<SummaryBox title="Strategy description">
		<p>{summary.long_description}</p>
	</SummaryBox>
</div>

<style lang="postcss">
	.strategy-overview-page {
		display: grid;
		gap: 1rem;

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

		.metrics {
			display: grid;
			gap: inherit;
			align-items: flex-start;

			dl {
				display: grid;
				grid-auto-flow: column;
				grid-auto-columns: 1fr;
			}

			:global([data-css-props]) {
				--key-metric-label-font: var(--f-ui-sm-medium);
				--key-metric-label-letter-spacing: var(--ls-ui-sm);
				--key-metric-value-font: var(--f-ui-xxl-medium);
				--key-metric-value-letter-spacing: var(--ls-ui-xxl);

				@media (--viewport-sm-down) {
					--key-metric-value-font: var(--f-ui-xl-medium);
					--key-metric-value-letter-spacing: var(--ls-ui-xl);
				}

				@media (--viewport-xs) {
					--key-metric-label-font: var(--f-ui-xs-medium);
					--key-metric-label-letter-spacing: var(--ls-ui-xs);
					--key-metric-value-font: var(--f-ui-lg-medium);
					--key-metric-value-letter-spacing: var(--ls-ui-lg);
				}
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
				color: hsl(var(--hsl-text-extra-light));
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
			color: hsl(var(--hsl-text-extra-light));
		}

		.description p {
			font: var(--f-paragraph-lg-roman);
			letter-spacing: var(--ls-paragraph-lg, normal);

			@media (--viewport-xs) {
				font: var(--f-paragraph-md-roman);
				letter-spacing: var(--ls-paragraph-md, normal);
			}
		}
	}
</style>
