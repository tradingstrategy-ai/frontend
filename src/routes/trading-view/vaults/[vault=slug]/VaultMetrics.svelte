<script lang="ts">
	import type { VaultFees, VaultInfo } from '$lib/top-vaults/schemas';
	import MetricsBox from '$lib/components/MetricsBox.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import Risk from '$lib/top-vaults/Risk.svelte';
	import Metric from './Metric.svelte';
	import IconQuestionCircle from '~icons/local/question-circle';
	import { getFormattedLockup, isGoodVaultStatus } from '$lib/top-vaults/helpers';
	import { formatNumber, formatPercent, formatPercentProfit } from '$lib/helpers/formatters';

	interface Props {
		vault: VaultInfo;
	}

	const HYPERCORE_CHAIN_ID = 9999;

	let { vault }: Props = $props();

	let isHyperCore = $derived(vault.chain_id === HYPERCORE_CHAIN_ID);
	let showTransactionStatus = $derived(!isGoodVaultStatus(vault));

	function getDaysUntil(dateString: string | null): number | null {
		if (!dateString) return null;
		const targetDate = new Date(dateString);
		const now = new Date();
		const diffMs = targetDate.getTime() - now.getTime();
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
		return diffDays;
	}

	let depositDaysLeft = $derived(getDaysUntil(vault.deposit_next_open));
	let redemptionDaysLeft = $derived(getDaysUntil(vault.redemption_next_open));

	let lifetimeMaxDrawdown = $derived(
		vault.period_results?.find((p) => p.period.toLowerCase() === 'lifetime')?.max_drawdown ?? null
	);
</script>

<div class="additional-metrics">
	{#if showTransactionStatus}
		<MetricsBox class="transaction-status" title="Transaction status">
			<div class="status-grid">
				<div class="status-item">
					<span class="status-label">Deposits</span>
					{#if vault.deposit_closed_reason}
						<span class="status-value closed">{vault.deposit_closed_reason}</span>
						{#if depositDaysLeft !== null && depositDaysLeft >= 0}
							<span class="status-next-open">Opens in {depositDaysLeft} {depositDaysLeft === 1 ? 'day' : 'days'}</span>
						{/if}
					{:else}
						<span class="status-value open">Open</span>
					{/if}
				</div>
				<div class="status-item">
					<span class="status-label">Redemptions</span>
					{#if vault.redemption_closed_reason}
						<span class="status-value closed">{vault.redemption_closed_reason}</span>
						{#if redemptionDaysLeft !== null && redemptionDaysLeft >= 0}
							<span class="status-next-open"
								>Opens in {redemptionDaysLeft} {redemptionDaysLeft === 1 ? 'day' : 'days'}</span
							>
						{/if}
					{:else}
						<span class="status-value open">Open</span>
					{/if}
				</div>
			</div>
		</MetricsBox>
	{/if}
	<MetricsBox class="other-metrics" title="Other metrics">
		<div class="metrics-inner">
			<div class="mobile">
				<Metric size="lg" label="3M Sharpe">
					{formatNumber(vault.three_months_sharpe, 1)}
				</Metric>

				<Metric size="lg" label="3M volatility">
					{formatPercent(vault.three_months_volatility, 1)}
				</Metric>
			</div>

			{#snippet ageLabel()}
				<Tooltip>
					<span slot="trigger">
						<span class="underline">Age*</span>
					</span>
					<svelte:fragment slot="popup">
						Due to Hyperliquid architecture, we currently have limited history of data on this vault and it might not
						reach all the way back to the launch of the vault.
					</svelte:fragment>
				</Tooltip>
			{/snippet}

			<Metric label={isHyperCore ? ageLabel : 'Age'}>
				{formatNumber(vault.years, 1)} years
			</Metric>

			{#snippet maxDrawdownLabel()}
				<Tooltip>
					<span slot="trigger">
						<a class="glossary-link" href="/glossary/maximum-drawdown">Maximum drawdown</a>
					</span>
					<svelte:fragment slot="popup">Maximum drawdown over the vault lifetime.</svelte:fragment>
				</Tooltip>
			{/snippet}

			<Metric label={maxDrawdownLabel}>
				{formatPercent(lifetimeMaxDrawdown)}
			</Metric>

			<Metric label="Protocol Technical Risk">
				<a class="risk-link" href="/blog/announcing-vault-technical-risk-framework-beta">
					<Risk risk={vault.risk} />
				</a>
			</Metric>

			<Metric label="Lockup period">
				{getFormattedLockup(vault)}
			</Metric>

			<Metric label="Denomination">
				<a class="denomination-link" href="/trading-view/vaults/stablecoins/{vault.denomination_slug}">
					{vault.denomination}
				</a>
			</Metric>
		</div>
	</MetricsBox>

	<MetricsBox class="returns" title="Returns">
		<table class="vault-metrics-table">
			<thead>
				<tr>
					<th></th>
					<th>1 month</th>
					<th>3 month</th>
					<th>Lifetime</th>
				</tr>
			</thead>
			<tbody>
				{#snippet returnsCell(ann: MaybeNumber, abs: MaybeNumber)}
					<td class="returns-cell">
						<div class="ann">{formatPercentProfit(ann)} ann</div>
						<div class="abs">{formatPercentProfit(abs)} abs</div>
					</td>
				{/snippet}
				<tr>
					<td>Gross</td>
					{@render returnsCell(vault.one_month_cagr, vault.one_month_returns)}
					{@render returnsCell(vault.three_months_cagr, vault.three_months_returns)}
					{@render returnsCell(vault.cagr, vault.lifetime_return)}
				</tr>
				<tr>
					<td>
						<Tooltip>
							<span slot="trigger">
								<span class="underline">Net</span>
								<IconQuestionCircle />
							</span>
							<svelte:fragment slot="popup">
								For comparing the profitability of vaults, the vault share price is reduced by the calculated net fees
								for the investment period.
							</svelte:fragment>
						</Tooltip>
					</td>
					{@render returnsCell(vault.one_month_cagr_net, vault.one_month_returns_net)}
					{@render returnsCell(vault.three_months_cagr_net, vault.three_months_returns_net)}
					{@render returnsCell(vault.cagr_net, vault.lifetime_return_net)}
				</tr>
			</tbody>
		</table>
	</MetricsBox>

	<MetricsBox class="fees" title="Fees">
		<table class="vault-metrics-table">
			<thead>
				<tr>
					<th></th>
					<th>Manage&shy;ment</th>
					<th>Perform&shy;ance</th>
					<th>Deposit</th>
					<th>Withdraw</th>
				</tr>
			</thead>
			<tbody>
				{#snippet feeRow(label: string, tooltip: string, fees: VaultFees | null)}
					<tr>
						<td class="fee-type-cell">
							<Tooltip>
								<span slot="trigger">
									<span class="underline">{label}</span>
									<IconQuestionCircle />
								</span>
								<svelte:fragment slot="popup">
									<!-- eslint-disable-next-line svelte/no-at-html-tags -->
									{@html tooltip}
								</svelte:fragment>
							</Tooltip>
						</td>
						<td>{formatPercent(fees?.management)}</td>
						<td>{formatPercent(fees?.performance)}</td>
						<td>{formatPercent(fees?.deposit)}</td>
						<td>{formatPercent(fees?.withdraw)}</td>
					</tr>
				{/snippet}

				{@render feeRow(
					'Gross',
					'<strong>Gross fees</strong> are what vaults track internally. They are not exposed to an investor, and only useful for internal profit calculations of the vault. Gross fees have already been deducted when the vault share price is updated.',
					vault.gross_fees
				)}

				{@render feeRow(
					'Net',
					'<strong>Net fees</strong> are deduced at a redemption. A vault investor receives less than the value of their shares back.',
					vault.net_fees
				)}
			</tbody>
		</table>
	</MetricsBox>
</div>

<style>
	.additional-metrics {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--gap);

		/* 2-column desktop layout */
		@media (--viewport-lg-up) {
			grid-template-columns: 1fr 1fr;

			:global(:is(.other-metrics, .transaction-status)) {
				grid-column: span 2;
			}
		}

		.status-grid {
			display: flex;
			flex-wrap: wrap;
			gap: var(--gap);
		}

		.status-item {
			display: flex;
			flex-direction: column;
			gap: 0.25rem;
		}

		.status-label {
			font: var(--f-ui-sm-medium);
			color: var(--c-text-light);
		}

		.status-value {
			font: var(--f-ui-md-medium);

			&.open {
				color: var(--c-success);
			}

			&.closed {
				color: var(--c-error);
			}
		}

		.status-next-open {
			font: var(--f-ui-sm-roman);
			color: var(--c-text-light);
			margin-top: 0.25rem;
		}

		.metrics-inner {
			display: flex;
			flex-wrap: wrap;
			justify-content: space-between;
			gap: var(--gap);
		}

		.vault-metrics-table {
			width: 100%;
			border-collapse: collapse;
			font: var(--f-ui-md-roman);
			--cell-padding: 0.5rem;

			@media (--viewport-sm-down) {
				font: var(--f-ui-sm-roman);
				--cell-padding: 0.5rem 0.25rem;
			}

			th {
				vertical-align: bottom;
				border-bottom: 2px solid var(--c-text-extra-light);
				color: var(--c-text);
				font-weight: bold;
				font-size: 0.875em;
			}

			td {
				border-bottom: 1px solid var(--c-box-3);
				color: var(--c-text-light);
			}

			:is(th, td) {
				padding: var(--cell-padding);

				&:first-child {
					font-weight: bold;
					color: var(--c-text);
				}

				&:not(:first-child) {
					text-align: right;
				}
			}

			.abs {
				padding-top: 0.25em;
				color: var(--c-text-extra-light);
			}
		}

		@media (--viewport-md-up) {
			:global(.popup) {
				max-width: 30rem;
			}
		}

		[slot='trigger'] {
			display: inline-flex;
			align-items: center;
			gap: 0.75ex;
		}

		.risk-link,
		.denomination-link,
		.glossary-link {
			text-decoration: underline;
			text-decoration-style: dashed;
		}
	}
</style>
