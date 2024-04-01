<script lang="ts">
	import type { StrategyRuntimeState } from 'trade-executor/strategy/runtime-state';
	import { UpDownIndicator } from '$lib/components';
	import { KeyMetric } from 'trade-executor/components';
	import { formatDaysAgo, formatNumber, formatPercent, formatPrice } from '$lib/helpers/formatters';
	import { formatProfitability } from 'trade-executor/helpers/formatters';
	import { metricDescriptions } from 'trade-executor/helpers/strategy-metric-help-texts';
	import { getLogoUrl } from '$lib/helpers/assets';

	export let strategy: StrategyRuntimeState;

	const backtestLink = `/strategies/${strategy.id}/backtest`;
	const keyMetrics = strategy.summary_statistics?.key_metrics ?? {};
	const assetManagementMode = strategy.on_chain_data?.asset_management_mode;
</script>

<div class="strategy-data-summary ds-3">
	{#if keyMetrics.cagr}
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
	{:else}
		<KeyMetric name="Profitability" metric={keyMetrics.profitability} {backtestLink} let:value>
			<UpDownIndicator {value} formatter={formatProfitability} />
		</KeyMetric>
	{/if}

	<KeyMetric
		name="Total value locked"
		metric={keyMetrics.total_equity}
		formatter={formatPrice}
		tooltipExtraDescription={metricDescriptions.tvl}
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

	<KeyMetric
		name="Age"
		metric={keyMetrics.started_at}
		formatter={formatDaysAgo}
		tooltipExtraDescription={metricDescriptions.age}
		{backtestLink}
	/>

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

	<KeyMetric name="Asset management" {backtestLink}>
		<div class="asset-management">
			{#if assetManagementMode === 'enzyme'}
				<img alt="Enzyme vault" src={getLogoUrl('token', 'enzyme')} />
				<span>Enzyme vault</span>
			{:else if assetManagementMode === 'hot_wallet'}
				<img alt="Hot wallet" src={getLogoUrl('wallet', 'metamask')} />
				<span>Hot wallet</span>
			{:else}
				---
			{/if}
		</div>
	</KeyMetric>
</div>

<style lang="postcss">
	.strategy-data-summary {
		display: flex;
		flex-wrap: wrap;
		gap: 1.125rem;
		list-style: none;
		margin-block: 1.25rem;
		padding: 0;

		@media (--viewport-sm-down) {
			margin-block: 0.75rem;
			gap: 0.75rem;
		}

		@container (width > 440px) {
			display: grid;
			grid-template-columns: repeat(3, auto);
		}

		@container (width > 512px) {
			grid-template-columns: repeat(4, auto);

			/* 1st and 2nd of 4 columns */
			:global(.tooltip:is(:nth-of-type(4n + 1), :nth-of-type(4n + 2)) .popup) {
				right: 12.5%;
			}

			/* 3rd and 4th of 4 columns */
			:global(.tooltip:is(:nth-of-type(4n + 3), :nth-of-type(4n + 4)) .popup) {
				left: 12.5%;
			}
		}

		:global(.popup) {
			left: 0;
			right: 0;
		}

		.asset-management {
			display: flex;
			gap: 0.75ex;
			align-items: center;
			font-size: 0.9em;

			img {
				height: 20px;
				width: 20px;
			}
		}
	}
</style>
