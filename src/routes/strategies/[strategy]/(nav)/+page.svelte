<script lang="ts">
	import { type Quote, ChartContainer, PerformanceChart, normalizeDataForInterval } from '$lib/chart';
	import { MyDeposits } from '$lib/wallet';
	import { UpDownIndicator, UpDownCell } from '$lib/components';
	import SummaryBox from './SummaryBox.svelte';
	import MetricsGroup from './MetricsGroup.svelte';
	import { formatDaysAgo, formatNumber, formatPercent, formatPrice } from '$lib/helpers/formatters';
	import { formatProfitability } from 'trade-executor/helpers/formatters';
	import { relativeProfitability } from 'trade-executor/helpers/profit';

	export let data;
	$: ({ chain, summary, streamed } = data);

	$: keyMetrics = summary.summary_statistics.key_metrics;

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
			<MetricsGroup>
				<div>
					<dt>Profitability</dt>
					<dd>
						<UpDownIndicator value={keyMetrics.profitability.value} formatter={formatPercent} />
					</dd>
				</div>
				<div>
					<dt>Age</dt>
					<dd>{formatDaysAgo(keyMetrics.started_at.value)}</dd>
				</div>
				<div>
					<dt>Total assets</dt>
					<dd>{formatPrice(keyMetrics.total_equity.value)}</dd>
				</div>
			</MetricsGroup>
		</SummaryBox>

		<SummaryBox title="Risk metrics">
			<MetricsGroup>
				<div>
					<dt>Max drawdown</dt>
					<dd>{formatPercent(keyMetrics.max_drawdown.value)}</dd>
				</div>
				<div>
					<dt>Sharpe</dt>
					<dd>{formatNumber(keyMetrics.sharpe.value)}</dd>
				</div>
				<div>
					<dt>Sortino</dt>
					<dd>{formatNumber(keyMetrics.sortino.value)}</dd>
				</div>
			</MetricsGroup>
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
