<script lang="ts">
	import { ChartContainer, PerformanceChart, normalzeDataForInterval } from '$lib/chart';
	import MetricsGroup from './MetricsGroup.svelte';
	import { formatDaysAgo, formatPercent, formatPrice } from '$lib/helpers/formatters';

	export let data;
	$: ({ chain, summary, state, profitabilityChart } = data);

	$: keyMetrics = summary.summary_statistics.key_metrics;
</script>

<svelte:head>
	<title>{summary.name} | Trading Strategy</title>
	<meta name="description" content={summary.long_description} />
</svelte:head>

<div class="strategy-overview-page">
	<div class="deposit-widget">Deposit widget</div>

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
		<MetricsGroup title="Summary Stats">
			<div>
				<dt>Profitability</dt>
				<dd>{formatPercent(keyMetrics.profitability.value)}</dd>
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
	</div>

	<div class="description">Strategy description</div>
</div>

<style lang="postcss">
	.strategy-overview-page {
		display: grid;
		gap: 1rem;

		/* Desktop 2 column layout */
		@media (--viewport-md-up) {
			gap: 1.5rem;
			grid-template-columns: 1fr auto;

			/* move deposit widget to row 2, col 2 */
			.deposit-widget {
				grid-area: 2 / 2;
			}

			/* chart and description span full row width */
			:is(.chart, .description) {
				grid-column: 1 / -1;
			}
		}

		.metrics {
			display: grid;
			gap: inherit;
			align-items: flex-start;
		}

		/* Placeholder styling - remove once real elements all added */
		:is(.deposit-widget, .description) {
			border-radius: var(--radius-md);
			padding: 1.5rem;
			background: hsl(var(--hsla-box-1));
			font: var(--f-heading-sm-medium);
			color: hsl(var(--hsl-text-extra-light));
		}
		.metrics {
			height: 15rem;
		}
		.deposit-widget {
			min-width: 18rem;
		}
		.description {
			height: 10rem;
		}
	}
</style>
