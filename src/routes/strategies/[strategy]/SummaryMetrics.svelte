<script lang="ts">
	import type { SummaryKeyMetrics } from 'trade-executor/strategy/summary';
	import MetricsBox from './MetricsBox.svelte';
	import { KeyMetric } from 'trade-executor/components';
	import { UpDownIndicator } from '$lib/components';
	import { formatDaysAgo, formatNumber, formatPercent, formatPrice } from '$lib/helpers/formatters';
	import { formatProfitability, formatTradesPerMonth } from 'trade-executor/helpers/formatters';
	import { metricDescriptions } from 'trade-executor/helpers/strategy-metric-help-texts';

	export let keyMetrics: SummaryKeyMetrics;
	export let backtestLink: string;
</script>

<div class="summary-metrics">
	<div class="metric-group primary">
		<MetricsBox>
			<KeyMetric
				name="Annual return"
				metric={keyMetrics.cagr}
				tooltipName="Compounding Annual Growth Rate (CAGR)"
				tooltipExtraDescription={metricDescriptions.cagr}
				{backtestLink}
				let:value
			>
				<UpDownIndicator {value} formatter={formatProfitability} />
			</KeyMetric>
		</MetricsBox>

		<MetricsBox>
			<KeyMetric
				name="Total value locked"
				metric={keyMetrics.total_equity}
				formatter={formatPrice}
				tooltipExtraDescription={metricDescriptions.tvl}
				{backtestLink}
			/>
		</MetricsBox>
	</div>

	<MetricsBox title="Timeframes">
		<div class="metric-group">
			<KeyMetric
				name="Age"
				metric={keyMetrics.started_at}
				formatter={formatDaysAgo}
				tooltipExtraDescription={metricDescriptions.age}
				{backtestLink}
			/>

			<KeyMetric
				name="Decision cycle"
				tooltipName="Decision cycle"
				metric={keyMetrics.decision_cycle_duration}
				tooltipExtraDescription={metricDescriptions.tradeFrequency}
				{backtestLink}
			/>

			<KeyMetric
				name="Trade frequency"
				tooltipName="Trade frequency"
				metric={keyMetrics.trades_per_month}
				formatter={formatTradesPerMonth}
				tooltipExtraDescription={metricDescriptions.tradeFrequency}
				{backtestLink}
			/>
		</div>
	</MetricsBox>

	<MetricsBox title="Risk metrics">
		<div class="metric-group">
			<KeyMetric
				name="Sharpe"
				tooltipName="Sharpe Ratio"
				metric={keyMetrics.sharpe}
				formatter={formatNumber}
				tooltipExtraDescription={metricDescriptions.cagr}
				{backtestLink}
			/>

			<KeyMetric
				name="Sortino"
				tooltipName="Sortino Ratio"
				metric={keyMetrics.sortino}
				formatter={formatNumber}
				{backtestLink}
			/>

			<KeyMetric
				name="Max drawdown"
				tooltipName="Maximum drawdown"
				metric={keyMetrics.max_drawdown}
				formatter={formatPercent}
				tooltipExtraDescription={metricDescriptions.maxDrawdown}
				{backtestLink}
			/>
		</div>
	</MetricsBox>
</div>

<style lang="postcss">
	.summary-metrics {
		display: grid;
		gap: inherit;
		align-items: flex-start;

		.metric-group {
			display: flex;
			flex-wrap: wrap;
			gap: 1rem 1.5rem;
			justify-content: space-between;

			&.primary > :global(*) {
				flex: 1;
			}

			@media (--viewport-xs) {
				> :global(*) {
					flex: 1;
				}
			}
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
</style>
