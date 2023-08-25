<script lang="ts">
	import type { StrategyRuntimeState } from 'trade-executor/strategy/runtime-state';
	import { DataBadge, Icon, Tooltip, UpDownIndicator } from '$lib/components';
	import StrategyDataDescription from './StrategyDataDescription.svelte';
	import { formatDaysAgo, formatDollar, formatNumber, formatPercent } from '$lib/helpers/formatters';
	import { getLogoUrl } from '$lib/helpers/assets';

	export let strategy: StrategyRuntimeState;

	const metrics = strategy.summary_statistics?.key_metrics ?? {};
	const backtestLink = `/strategies/${strategy.id}/backtest`;
	const hasEnzymeVault = strategy.on_chain_data?.asset_management_mode === 'enzyme';
	const assetManagementLabel = hasEnzymeVault ? 'Enzyme vault' : 'Hot wallet';

	let badgeSize: 'md' | 'sm' = 'md';
	let innerWidth: number;

	$: badgeSize = innerWidth < 768 ? 'sm' : 'md';
</script>

<svelte:window bind:innerWidth />

<dl class="strategy-data-summary ds-3">
	<Tooltip>
		<svelte:fragment slot="trigger">
			<dt>
				<span>Profitability</span>
				<Icon name="question-circle" />
			</dt>
			<dd data-testid="key-metric-profitability-value">
				<UpDownIndicator value={metrics.profitability?.value} formatter={formatPercent} let:direction let:formatted>
					<DataBadge bearish={direction < 0} bullish={direction > 0} size={badgeSize}>
						{direction > 0 ? '▲' : direction < 0 ? '▼' : ''}
						{formatted}
					</DataBadge>
				</UpDownIndicator>
			</dd>
		</svelte:fragment>
		<StrategyDataDescription slot="popup" title="Profitability" metric={metrics.profitability} {backtestLink} />
	</Tooltip>

	<Tooltip>
		<svelte:fragment slot="trigger">
			<dt>
				<span>Total assets</span>
				<Icon name="question-circle" />
			</dt>
			<dd>
				<DataBadge size={badgeSize}>
					{formatDollar(metrics.total_equity?.value)}
				</DataBadge>
			</dd>
		</svelte:fragment>
		<StrategyDataDescription slot="popup" title="Total assets" metric={metrics.total_equity} {backtestLink} />
	</Tooltip>

	<Tooltip>
		<svelte:fragment slot="trigger">
			<dt>
				<span>Maximum drawdown</span>
				<Icon name="question-circle" />
			</dt>
			<dd>
				<DataBadge size={badgeSize}>
					{formatPercent(metrics.max_drawdown?.value)}
				</DataBadge>
			</dd>
		</svelte:fragment>
		<StrategyDataDescription slot="popup" title="Maximum drawdown" metric={metrics.max_drawdown} {backtestLink} />
	</Tooltip>

	<Tooltip>
		<svelte:fragment slot="trigger">
			<dt>
				<span>Age</span>
				<Icon name="question-circle" />
			</dt>
			<dd>
				<DataBadge size={badgeSize}>
					{formatDaysAgo(metrics.started_at?.value)}
				</DataBadge>
			</dd>
		</svelte:fragment>
		<StrategyDataDescription slot="popup" title="Age" metric={metrics.started_at} {backtestLink} />
	</Tooltip>

	<Tooltip>
		<svelte:fragment slot="trigger">
			<dt>
				<span>Sharpe</span>
				<Icon name="question-circle" />
			</dt>
			<dd>
				<DataBadge size={badgeSize}>
					{formatNumber(metrics.sharpe?.value)}
				</DataBadge>
			</dd>
		</svelte:fragment>
		<StrategyDataDescription slot="popup" title="Sharpe" metric={metrics.sharpe} {backtestLink} />
	</Tooltip>

	<Tooltip>
		<svelte:fragment slot="trigger">
			<dt>
				<span>Sortino</span>
				<Icon name="question-circle" />
			</dt>
			<dd>
				<DataBadge size={badgeSize}>
					{formatNumber(metrics.sortino?.value)}
				</DataBadge>
			</dd>
		</svelte:fragment>
		<StrategyDataDescription slot="popup" title="Sortino" metric={metrics.sortino} {backtestLink} />
	</Tooltip>

	<Tooltip>
		<svelte:fragment slot="trigger">
			<dt>
				<span>Assets management</span>
				<Icon name="question-circle" />
			</dt>
			<dd>
				<DataBadge size={badgeSize}>
					{#if hasEnzymeVault}
						<img alt={assetManagementLabel} src={getLogoUrl('token', 'enzyme')} height="20" width="20" />
					{:else}
						<img alt={assetManagementLabel} src={getLogoUrl('wallet', 'metamask')} height="20" width="20" />
					{/if}
					<span>{assetManagementLabel}</span>
				</DataBadge>
			</dd>
		</svelte:fragment>
		<svelte:fragment slot="popup">
			This strategy's assets are managed using <strong>{assetManagementLabel}</strong>
		</svelte:fragment>
	</Tooltip>
</dl>

<style lang="postcss">
	.strategy-data-summary {
		display: flex;
		flex-wrap: wrap;
		gap: 1.125rem;
		list-style: none;
		padding: 0;

		@media (--viewport-sm-down) {
			gap: 0.75rem;
		}

		@container (width > 440px) {
			display: grid;
			grid-template-columns: repeat(3, auto);
		}

		@container (width > 512px) {
			grid-template-columns: repeat(4, auto);

			/* 1st and 2nd of 4 columns */
			& :global(.tooltip:is(:nth-of-type(4n + 1), :nth-of-type(4n + 2)) .popup) {
				right: 12.5%;
			}

			/* 3rd and 4th of 4 columns */
			& :global(.tooltip:is(:nth-of-type(4n + 3), :nth-of-type(4n + 4)) .popup) {
				left: 12.5%;
			}
		}

		& dt {
			display: flex;
			align-items: center;
			gap: 0.375rem;
			margin-bottom: 0.375rem;
			font: var(--f-ui-sm-medium);
			letter-spacing: var(--f-ui-sm-spacing);
			color: hsla(var(--hsl-text-light));
			--icon-size: 1.25em;

			@media (--viewport-sm-down) {
				gap: 0.25rem;
				margin-bottom: 0.25rem;
				font: var(--f-ui-xs-medium);
				letter-spacing: var(--f-ui-xs-spacing);
			}
		}

		& :global(.popup) {
			left: 0;
			right: 0;
		}
	}
</style>
