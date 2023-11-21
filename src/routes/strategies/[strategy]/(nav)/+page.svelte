<script lang="ts">
	import { ChartContainer, PerformanceChart, normalzeDataForInterval } from '$lib/chart';
	import { MyDeposits } from '$lib/wallet';
	import { UpDownIndicator } from '$lib/components';
	import SummaryBox from './SummaryBox.svelte';
	import MetricsGroup from './MetricsGroup.svelte';
	import { formatDaysAgo, formatNumber, formatPercent, formatPrice } from '$lib/helpers/formatters';

	export let data;
	$: ({ chain, summary, state, profitabilityChart } = data);

	$: keyMetrics = summary.summary_statistics.key_metrics;
</script>

<svelte:head>
	<title>{summary.name} | Trading Strategy</title>
	<meta name="description" content={summary.long_description} />
</svelte:head>

<div class="strategy-overview-page">
	<MyDeposits strategy={summary} {chain} />

	<div class="chart">
		{#if profitabilityChart}
			<ChartContainer let:timeSpan={{ spanDays, interval, periodicity }}>
				<PerformanceChart
					data={normalzeDataForInterval(profitabilityChart.data, interval)}
					formatValue={formatPercent}
					{spanDays}
					{periodicity}
				/>
			</ChartContainer>
		{/if}
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
			grid-template-columns: 2fr 1fr;

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
