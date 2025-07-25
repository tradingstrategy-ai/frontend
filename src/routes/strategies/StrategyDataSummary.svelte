<script lang="ts">
	import type { StrategyInfo } from 'trade-executor/models/strategy-info';
	import { createVaultAdapter } from 'trade-executor/vaults';
	import { EntitySymbol, Profitability } from '$lib/components';
	import KeyMetric from 'trade-executor/components/KeyMetric.svelte';
	import { formatDaysAgo, formatDollar, formatNumber, formatPercent } from '$lib/helpers/formatters';
	import { metricDescriptions } from 'trade-executor/helpers/strategy-metric-help-texts';
	import { calculateAltCagr } from 'trade-executor/helpers/metrics';

	type Props = {
		simplified?: boolean;
		strategy: StrategyInfo;
	};

	let { simplified = false, strategy }: Props = $props();

	const backtestLink = `/strategies/${strategy.id}/backtest`;
	const keyMetrics = strategy.summary_statistics?.key_metrics ?? {};
	const vault = strategy.connected ? createVaultAdapter(strategy.on_chain_data, strategy.fees) : undefined;

	// Temporary hack to address inaccurate CAGR metric (remove below 2 lines once this is fixed)
	// Replace API-provided CAGR metric with alternative calculated CAGR
	const altCagr = calculateAltCagr(strategy.summary_statistics?.compounding_unrealised_trading_profitability);
	if (altCagr && !strategy.useSharePrice) keyMetrics.cagr = altCagr;

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
			<Profitability of={value} />
		</KeyMetric>
	{:else}
		<KeyMetric name="Profitability" metric={keyMetrics.profitability} {backtestLink} let:value>
			<Profitability of={value} />
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
				{#if vault}
					<EntitySymbol label={vault.mode} logoUrl={vault.logoUrl} />
				{:else}
					---
				{/if}
			</div>
		</KeyMetric>
	{/if}
</div>

<style>
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
