<script lang="ts">
	import type { StrategyRuntimeState } from 'trade-executor/strategy/runtime-state';
	import { EntitySymbol, UpDownIndicator } from '$lib/components';
	import { KeyMetric } from 'trade-executor/components';
	import { formatDaysAgo, formatNumber, formatPercent, formatDollar } from '$lib/helpers/formatters';
	import { formatProfitability } from 'trade-executor/helpers/formatters';
	import { metricDescriptions } from 'trade-executor/helpers/strategy-metric-help-texts';
	import { getLogoUrl } from '$lib/helpers/assets';

	export let simplified = false;
	export let strategy: StrategyRuntimeState;

	const backtestLink = `/strategies/${strategy.id}/backtest`;
	const keyMetrics = strategy.summary_statistics?.key_metrics ?? {};
	const assetManagementMode = strategy.on_chain_data?.asset_management_mode;

	function formatTvl(value: MaybeNumber) {
		const digits = value && value < 1000 ? 2 : 1;
		return formatDollar(value, digits);
	}
</script>

<div class="strategy-data-summary ds-3" class:simplified>
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
		name="TVL"
		tooltipName="Total value locked"
		metric={keyMetrics.total_equity}
		formatter={formatTvl}
		tooltipExtraDescription={metricDescriptions.tvl}
		{backtestLink}
	/>

	{#if !simplified}
		<KeyMetric
			name="Max drawdown"
			tooltipName="Maximum drawdown"
			metric={keyMetrics.max_drawdown}
			formatter={formatPercent}
			tooltipExtraDescription={metricDescriptions.maxDrawdown}
			{backtestLink}
		/>
	{/if}

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
		tooltipExtraDescription={metricDescriptions.sharpe}
		{backtestLink}
	/>

	{#if !simplified}
		<KeyMetric
			name="Sortino"
			tooltipName="Sortino Ratio"
			metric={keyMetrics.sortino}
			formatter={formatNumber}
			{backtestLink}
		/>
	{/if}

	{#if !simplified}
		<KeyMetric name="Asset management" {backtestLink}>
			<div class="asset-management">
				{#if assetManagementMode === 'enzyme'}
					<EntitySymbol label="Enzyme vault" logoUrl={getLogoUrl('token', 'enzyme')} />
				{:else if assetManagementMode === 'hot_wallet'}
					<EntitySymbol label="Hot wallet" logoUrl={getLogoUrl('wallet', 'metamask')} />
				{:else}
					---
				{/if}
			</div>
		</KeyMetric>
	{/if}
</div>

<style lang="postcss">
	.strategy-data-summary {
		display: flex;
		flex-wrap: wrap;
		gap: 1.125rem;
		list-style: none;
		margin-block: 1.25rem;
		padding: 0;

		&.simplified {
			display: flex;
			justify-content: space-between;
			gap: 1rem 0.75rem;
		}

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
			> :global(:nth-child(4n + 1)),
			> :global(:nth-child(4n + 2)) {
				--popup-right: 12.5%;
			}

			/* 3rd and 4th of 4 columns */
			> :global(:nth-child(4n + 3)),
			> :global(:nth-child(4n + 4)) {
				--popup-left: 12.5%;
			}
		}

		:global(.popup) {
			left: var(--popup-left, 0);
			right: var(--popup-right, 0);
		}

		.asset-management {
			font-size: 0.9em;
		}
	}
</style>
