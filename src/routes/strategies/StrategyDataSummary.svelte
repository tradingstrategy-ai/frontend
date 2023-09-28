<script lang="ts">
	import type { StrategyRuntimeState } from 'trade-executor/strategy/runtime-state';
	import { DataBadge, UpDownIndicator } from '$lib/components';
	import KeyMetric from './KeyMetric.svelte';
	import { formatDaysAgo, formatDollar, formatNumber, formatPercent } from '$lib/helpers/formatters';
	import { formatProfitability } from 'trade-executor/helpers/formatters';
	import { getLogoUrl } from '$lib/helpers/assets';

	export let strategy: StrategyRuntimeState;

	const metrics = strategy.summary_statistics?.key_metrics ?? {};
	const backtestLink = `/strategies/${strategy.id}/backtest`;
	const hasEnzymeVault = strategy.on_chain_data?.asset_management_mode === 'enzyme';
	const assetManagementLabel = hasEnzymeVault ? 'Enzyme vault' : 'Hot wallet';

	let innerWidth: number;
	let badgeSize: 'sm' | 'md' = 'md';
	$: badgeSize = innerWidth < 768 ? 'sm' : 'md';
</script>

<svelte:window bind:innerWidth />

<dl class="strategy-data-summary ds-3">
	<KeyMetric name="Profitability" metric={metrics.profitability} {backtestLink} {badgeSize}>
		<svelte:fragment slot="value" let:value>
			<UpDownIndicator {value} formatter={formatProfitability} let:direction let:formatted>
				{@const status = direction > 0 ? 'bullish' : direction < 0 ? 'bearish' : 'default'}
				<DataBadge size={badgeSize} {status}>
					{formatted}
				</DataBadge>
			</UpDownIndicator>
		</svelte:fragment>
	</KeyMetric>

	<KeyMetric name="Total assets" metric={metrics.total_equity} formatter={formatDollar} {backtestLink} {badgeSize} />

	<KeyMetric name="Max drawdown" metric={metrics.max_drawdown} formatter={formatPercent} {backtestLink} {badgeSize} />

	<KeyMetric name="Age" metric={metrics.started_at} formatter={formatDaysAgo} {backtestLink} {badgeSize} />

	<KeyMetric name="Sharpe" metric={metrics.sharpe} formatter={formatNumber} {backtestLink} {badgeSize} />

	<KeyMetric name="Sortino" metric={metrics.sortino} formatter={formatNumber} {backtestLink} {badgeSize} />

	<KeyMetric name="Asset management" {backtestLink} {badgeSize}>
		<DataBadge slot="value" size={badgeSize}>
			{#if hasEnzymeVault}
				<img alt={assetManagementLabel} src={getLogoUrl('token', 'enzyme')} height="20" width="20" />
			{:else}
				<img alt={assetManagementLabel} src={getLogoUrl('wallet', 'metamask')} height="20" width="20" />
			{/if}
			<span>{assetManagementLabel}</span>
		</DataBadge>
		<svelte:fragment slot="tooltip-popup">
			This strategy's assets are managed using <strong>{assetManagementLabel}</strong>
		</svelte:fragment>
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
	}
</style>
