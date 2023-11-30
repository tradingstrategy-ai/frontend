<script lang="ts">
	import type { StrategyRuntimeState } from 'trade-executor/strategy/runtime-state';
	import { UpDownIndicator } from '$lib/components';
	import { KeyMetric } from 'trade-executor/components';
	import { formatDaysAgo, formatDollar, formatNumber, formatPercent } from '$lib/helpers/formatters';
	import { formatProfitability } from 'trade-executor/helpers/formatters';
	import { getLogoUrl } from '$lib/helpers/assets';

	export let strategy: StrategyRuntimeState;

	const metrics = strategy.summary_statistics?.key_metrics ?? {};
	const strategyId = strategy.id;
	const hasEnzymeVault = strategy.on_chain_data?.asset_management_mode === 'enzyme';
</script>

<dl class="strategy-data-summary ds-3">
	<KeyMetric name="Profitability" metric={metrics.profitability} {strategyId} let:value>
		<UpDownIndicator {value} formatter={formatProfitability} />
	</KeyMetric>

	<KeyMetric name="Total assets" metric={metrics.total_equity} formatter={formatDollar} {strategyId} />

	<KeyMetric name="Max drawdown" metric={metrics.max_drawdown} formatter={formatPercent} {strategyId} />

	<KeyMetric name="Age" metric={metrics.started_at} formatter={formatDaysAgo} {strategyId} />

	<KeyMetric name="Sharpe" metric={metrics.sharpe} formatter={formatNumber} {strategyId} />

	<KeyMetric name="Sortino" metric={metrics.sortino} formatter={formatNumber} {strategyId} />

	<KeyMetric name="Asset management" {strategyId}>
		<div class="asset-management">
			{#if hasEnzymeVault}
				<img alt="Enzyme vault" src={getLogoUrl('token', 'enzyme')} />
				<span>Enzyme vault</span>
			{:else}
				<img alt="Hot wallet" src={getLogoUrl('wallet', 'metamask')} />
				<span>Hot wallet</span>
			{/if}
		</div>
	</KeyMetric>
</dl>

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
