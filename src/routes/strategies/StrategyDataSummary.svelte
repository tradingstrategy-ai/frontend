<script lang="ts">
	import type { StrategyRuntimeState } from 'trade-executor/strategy/runtime-state';
	import { DataBadge, Icon, Tooltip } from '$lib/components';
	import StrategyDataDescription from './StrategyDataDescription.svelte';
	import { formatDaysAgo, formatDollar, formatPercent } from '$lib/helpers/formatters';
	import { getLogoUrl } from '$lib/helpers/assets';

	export let backtestLink: string;
	export let strategy: StrategyRuntimeState;

	let badgeSize: 'md' | 'sm' = 'md';
	let innerWidth: number;

	$: badgeSize = innerWidth < 768 ? 'sm' : 'md';
</script>

<svelte:window bind:innerWidth />

<dl class="strategy-data-summary ds-3">
	<Tooltip>
		<svelte:fragment slot="trigger">
			<dt class="label">
				<span>Profitability</span>
				<Icon name="question-circle" />
			</dt>
			<dd data-testid="key-metric-profitability-value">
				<DataBadge
					bearish={strategy?.summary_statistics?.key_metrics?.profitability.value < 0}
					bullish={strategy?.summary_statistics?.key_metrics?.profitability.value > 0}
					size={badgeSize}
				>
					{#if strategy?.summary_statistics?.key_metrics?.profitability.value > 0}
						▲
					{:else}
						▼
					{/if}
					{formatPercent(strategy?.summary_statistics?.key_metrics?.profitability.value)}</DataBadge
				>
			</dd>
		</svelte:fragment>
		<svelte:fragment slot="popup">
			<StrategyDataDescription
				{backtestLink}
				metric={strategy?.summary_statistics?.key_metrics?.profitability}
				title="Profitability"
			/>
		</svelte:fragment>
	</Tooltip>

	<Tooltip>
		<svelte:fragment slot="trigger">
			<dt class="label">
				<span>Total assets</span>
				<Icon name="question-circle" />
			</dt>
			<dd>
				<DataBadge size={badgeSize}
					>{formatDollar(strategy?.summary_statistics?.key_metrics?.total_equity.value)}</DataBadge
				>
			</dd>
		</svelte:fragment>
		<svelte:fragment slot="popup">
			<StrategyDataDescription
				{backtestLink}
				metric={strategy?.summary_statistics?.key_metrics?.total_equity}
				title="Total assets"
			/>
		</svelte:fragment>
	</Tooltip>

	<Tooltip>
		<svelte:fragment slot="trigger">
			<dt class="label">
				<span>Maximum drawdown</span>
				<Icon name="question-circle" />
			</dt>
			<dd>
				<DataBadge size={badgeSize}
					>{formatPercent(strategy?.summary_statistics?.key_metrics?.max_drawdown.value)}</DataBadge
				>
			</dd>
		</svelte:fragment>
		<svelte:fragment slot="popup">
			<StrategyDataDescription
				{backtestLink}
				metric={strategy?.summary_statistics?.key_metrics?.max_drawdown}
				title="Maximum drawdown"
			/>
		</svelte:fragment>
	</Tooltip>

	<Tooltip>
		<svelte:fragment slot="trigger">
			<dt class="label">
				<span>Age</span>
			</dt>
			<dd>
				<DataBadge size={badgeSize}>
					{formatDaysAgo(strategy?.summary_statistics?.key_metrics?.started_at.value)}
				</DataBadge>
			</dd>
		</svelte:fragment>
		<svelte:fragment slot="popup">
			<StrategyDataDescription
				{backtestLink}
				metric={strategy?.summary_statistics?.key_metrics?.started_at}
				title="Age"
			/>
		</svelte:fragment>
	</Tooltip>

	<Tooltip>
		<svelte:fragment slot="trigger">
			<dt class="label">
				<span>Sharpe</span>
				<Icon name="question-circle" />
			</dt>
			<dd>
				<DataBadge size={badgeSize}>{strategy?.summary_statistics?.key_metrics?.sharpe.value?.toFixed(2)}</DataBadge>
			</dd>
		</svelte:fragment>
		<svelte:fragment slot="popup">
			<StrategyDataDescription
				{backtestLink}
				metric={strategy?.summary_statistics?.key_metrics?.sharpe}
				title="Sharpe"
			/>
		</svelte:fragment>
	</Tooltip>

	<Tooltip>
		<svelte:fragment slot="trigger">
			<dt class="label">
				<span>Sortino</span>
				<Icon name="question-circle" />
			</dt>
			<dd>
				<DataBadge size={badgeSize}>{strategy?.summary_statistics?.key_metrics?.sortino.value?.toFixed(2)}</DataBadge>
			</dd>
		</svelte:fragment>
		<svelte:fragment slot="popup">
			<StrategyDataDescription
				{backtestLink}
				metric={strategy?.summary_statistics?.key_metrics?.sortino}
				title="Sortino"
			/>
		</svelte:fragment>
	</Tooltip>

	<Tooltip>
		<svelte:fragment slot="trigger">
			<dt class="label">
				<span>Assets management</span>
				<Icon name="question-circle" />
			</dt>
			<dd>
				<DataBadge size={badgeSize}>
					{#if strategy?.on_chain_data?.asset_management_mode === 'enzyme'}
						<img alt="Enzyme vault" src={getLogoUrl('token', 'enzyme')} height="20" width="20" />
						<span>Enzyme vault</span>
					{:else}
						<img alt="Enzyme vault" src={getLogoUrl('wallet', 'metamask')} height="20" width="20" />
						<span>Hot wallet</span>
					{/if}
				</DataBadge>
			</dd>
		</svelte:fragment>
		<svelte:fragment slot="popup">
			This strategy's assets are managed using <strong
				>{strategy?.on_chain_data?.asset_management_mode === 'enzyme' ? 'Enzyme vault' : 'Hot Wallet'}</strong
			>
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

			& :global(.tooltip:is(:nth-of-type(4n + 1), :nth-of-type(4n + 2)) .popup) {
				left: 0;
				right: 12.5%;
			}

			& :global(.tooltip:is(:nth-of-type(4n + 3), :nth-of-type(4n + 4)) .popup) {
				left: 12.5% !important;
				right: 0 !important;
			}
		}
	}

	& dd {
		margin: 0;
	}

	& strong {
		font-weight: 700;
	}

	:global(.strategy-data-summary .tooltip) {
		& dt span {
			color: hsla(var(--hsl-text-light));
			font: var(--f-ui-sm-medium);
		}

		& .label {
			align-items: center;
			display: flex;
			gap: 0.375rem;
			margin-bottom: 0.375rem;

			& span {
				white-space: nowrap;
				overflow-x: hidden;
				text-overflow: ellipsis;
			}

			@media (--viewport-sm-down) {
				margin-bottom: 0.25rem;
				& span {
					font: var(--f-ui-xs-medium);
				}

				& :global(.icon) {
					--size: 0.75rem !important;
				}
			}
		}

		& :global(.popup) {
			left: 0;
			right: 0;
			translate: 0 0.25rem !important;
		}
	}
</style>
