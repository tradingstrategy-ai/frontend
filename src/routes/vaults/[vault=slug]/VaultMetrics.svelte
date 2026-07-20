<!--
@component
Displays supplementary vault information, including transaction status, performance, fees, and risk metrics.
-->
<script lang="ts">
	import type { VaultInfo } from '$lib/top-vaults/schemas';
	import MetricsBox from '$lib/components/MetricsBox.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import Risk from '$lib/top-vaults/Risk.svelte';
	import Metric from './Metric.svelte';
	import { resolve } from '$app/paths';
	import { getFormattedLockup, isGoodVaultStatus } from '$lib/top-vaults/helpers';
	import { formatNumber, formatPercent, formatPercentProfit } from '$lib/helpers/formatters';
	import { getChain } from '$lib/helpers/chain';
	import {
		getStablecoinDetailsHref,
		getVaultDenominationLogoUrl,
		resolveStablecoinSlug
	} from '$lib/stablecoin-metadata/helpers';
	import type { StablecoinMetadata } from '$lib/stablecoin-metadata/schemas';

	interface Props {
		vault: VaultInfo;
		stablecoinMetadata?: StablecoinMetadata | null;
	}

	const LIMITED_HISTORY_CHAINS = [9999, 9998, 9997];
	const NO_DATA_LABEL = 'No data';
	const MISSING_FEE_TOOLTIP = 'The fee information is not available onchain. Net returns cannot be calculated.';
	const INTERNALISED_FEE_TOOLTIP =
		'Fees are internalised and already reduced from the gross profit and thus reflected in the share price.';
	const INTERNALISED_FEE_DISCLAIMER = 'Fees are internalised for this vault and already removed from the gross profit.';

	let { vault, stablecoinMetadata = null }: Props = $props();

	let chain = $derived(getChain(vault.chain_id));
	let hasLimitedHistory = $derived(LIMITED_HISTORY_CHAINS.includes(vault.chain_id));
	let showTransactionStatus = $derived(!isGoodVaultStatus(vault));
	let hasNetFeeInformation = $derived(vault.net_fees?.fee_mode != null);
	let hasInternalisedFees = $derived(
		vault.fee_internalised === true ||
			vault.gross_fees?.fee_mode?.startsWith('internalised') ||
			vault.net_fees?.fee_mode?.startsWith('internalised')
	);
	let denominationSlug = $derived(
		resolveStablecoinSlug({
			slug: vault.denomination_slug,
			symbol: vault.denomination,
			name: vault.normalised_denomination
		})
	);
	let denominationLogoUrl = $derived(getVaultDenominationLogoUrl(vault, denominationSlug));
	let denominationHref = $derived(stablecoinMetadata ? getStablecoinDetailsHref(denominationSlug) : undefined);

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
	let periodResults = $derived(new Map(vault.period_results.map((metrics) => [metrics.period.toLowerCase(), metrics])));
	let returnPeriods = $derived([
		{
			label: '1M',
			samplePeriod: periodResults.get('1m'),
			gross: { annualised: vault.one_month_cagr, raw: vault.one_month_returns },
			net: { annualised: vault.one_month_cagr_net, raw: vault.one_month_returns_net }
		},
		{
			label: '3M',
			samplePeriod: periodResults.get('3m'),
			gross: { annualised: vault.three_months_cagr, raw: vault.three_months_returns },
			net: { annualised: vault.three_months_cagr_net, raw: vault.three_months_returns_net }
		},
		{
			label: '6M',
			samplePeriod: periodResults.get('6m'),
			gross: {
				annualised: periodResults.get('6m')?.cagr_gross ?? null,
				raw: periodResults.get('6m')?.returns_gross ?? null
			},
			net: {
				annualised: periodResults.get('6m')?.cagr_net ?? null,
				raw: periodResults.get('6m')?.returns_net ?? null
			}
		},
		{
			label: '1Y',
			samplePeriod: periodResults.get('1y'),
			gross: {
				annualised: periodResults.get('1y')?.cagr_gross ?? null,
				raw: periodResults.get('1y')?.returns_gross ?? null
			},
			net: {
				annualised: periodResults.get('1y')?.cagr_net ?? null,
				raw: periodResults.get('1y')?.returns_net ?? null
			}
		},
		{
			label: 'Lifetime',
			samplePeriod: periodResults.get('lifetime'),
			gross: { annualised: vault.cagr, raw: vault.lifetime_return },
			net: { annualised: vault.cagr_net, raw: vault.lifetime_return_net }
		}
	]);
	let feeRows = $derived([
		{
			label: 'Performance fee',
			mobileLabel: 'Performance',
			value: vault.gross_fees?.performance,
			tooltip: '<strong>Performance fee</strong> is charged against investment profits.'
		},
		{
			label: 'Management fee',
			mobileLabel: 'Management',
			value: vault.gross_fees?.management,
			tooltip: '<strong>Management fee</strong> is charged annually for managing the vault.'
		},
		{
			label: 'Deposit fee',
			mobileLabel: 'Deposit',
			value: vault.gross_fees?.deposit,
			tooltip: '<strong>Deposit fee</strong> is a one-time fee applied when entering the vault.'
		},
		{
			label: 'Withdrawal fee',
			mobileLabel: 'Withdrawal',
			value: vault.gross_fees?.withdraw,
			tooltip: '<strong>Withdrawal fee</strong> is a one-time fee applied when exiting the vault.'
		}
	]);

	function formatDate(value: string | null | undefined): string {
		if (value == null) return 'unknown';
		return value.split('T')[0] ?? 'unknown';
	}

	function getSamplePeriodLabel(period: (typeof returnPeriods)[number]): string {
		if (!period.samplePeriod) return period.label;

		return `${period.label}, ${formatDate(period.samplePeriod.period_start_at)} to ${formatDate(period.samplePeriod.period_end_at)}`;
	}

	function isMissingFeeValue(value: number | null | undefined): boolean {
		return value == null;
	}

	function isNetReturnUnavailable(period: (typeof returnPeriods)[number]): boolean {
		return !hasNetFeeInformation && period.net.annualised == null;
	}

	function withInternalisedFeeTooltip(tooltip: string): string {
		if (!hasInternalisedFees) return tooltip;
		return `${tooltip}<p>${INTERNALISED_FEE_TOOLTIP}</p>`;
	}
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
						Due to {chain?.name} architecture, we currently have limited history of data on this vault and it might not reach
						all the way back to the launch of the vault.
					</svelte:fragment>
				</Tooltip>
			{/snippet}

			<Metric label={hasLimitedHistory ? ageLabel : 'Age'}>
				{formatNumber(vault.years, 1)} years
			</Metric>

			{#snippet maxDrawdownLabel()}
				<Tooltip>
					<span slot="trigger">
						<a class="glossary-link" href={resolve('/glossary/maximum-drawdown')}>Maximum drawdown</a>
					</span>
					<svelte:fragment slot="popup">Maximum drawdown over the vault lifetime.</svelte:fragment>
				</Tooltip>
			{/snippet}

			<Metric label={maxDrawdownLabel}>
				{formatPercent(lifetimeMaxDrawdown)}
			</Metric>

			<Metric label="Protocol Technical Risk">
				<a class="risk-link" href={resolve('/blog/announcing-vault-technical-risk-framework-beta')}>
					<Risk risk={vault.risk} />
				</a>
			</Metric>

			<Metric label="Lockup period">
				{getFormattedLockup(vault)}
			</Metric>

			<Metric label="Denomination">
				{#if denominationHref}
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
					<a class="denomination-link" href={denominationHref}>
						{#if denominationLogoUrl}
							<img class="denomination-logo" src={denominationLogoUrl} alt="" />
						{/if}
						{vault.denomination}
					</a>
				{:else}
					<span class="denomination-link">
						{#if denominationLogoUrl}
							<img class="denomination-logo" src={denominationLogoUrl} alt="" />
						{/if}
						{vault.denomination}
					</span>
				{/if}
			</Metric>
		</div>
	</MetricsBox>

	<MetricsBox class="performance" title="Returns and fees">
		<div class="table-scroll">
			<table class="vault-metrics-table">
				<thead>
					<tr>
						<th></th>
						{#each returnPeriods as period (period.label)}
							<th scope="col">{period.label}</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#snippet metricLabel(tooltip: string, label: string, mobileLabel?: string)}
						<Tooltip>
							<span slot="trigger">
								<span class="underline">
									<span class="label-desktop">{label}</span>
									<span class="label-mobile">{mobileLabel ?? label}</span>
								</span>
							</span>
							<svelte:fragment slot="popup">
								<!-- eslint-disable-next-line svelte/no-at-html-tags -->
								{@html tooltip}
							</svelte:fragment>
						</Tooltip>
					{/snippet}
					{#snippet noDataCell()}
						<span class="no-data-tooltip">
							<Tooltip>
								<span slot="trigger" class="no-data-cell">{NO_DATA_LABEL}</span>
								<svelte:fragment slot="popup">{MISSING_FEE_TOOLTIP}</svelte:fragment>
							</Tooltip>
						</span>
					{/snippet}
					<tr>
						<td>
							{@render metricLabel(
								'<strong>Gross returns</strong> are annualised. They reflect the change in the vault share price before investor-facing fees are deducted.',
								'Gross'
							)}
						</td>
						{#each returnPeriods as period (period.label)}
							<td>
								<Tooltip>
									<span slot="trigger" class="return-cell">{formatPercentProfit(period.gross.annualised)}</span>
									<svelte:fragment slot="popup">
										<dl class="return-tooltip">
											<div>
												<dt>Annualised:</dt>
												<dd>{formatPercentProfit(period.gross.annualised)}</dd>
											</div>
											<div>
												<dt>Raw:</dt>
												<dd>{formatPercentProfit(period.gross.raw)}</dd>
											</div>
											<div>
												<dt>Sampled period:</dt>
												<dd>{getSamplePeriodLabel(period)}</dd>
											</div>
										</dl>
									</svelte:fragment>
								</Tooltip>
							</td>
						{/each}
					</tr>
					{#each feeRows as fee (fee.label)}
						<tr class="fee-row">
							<td>{@render metricLabel(withInternalisedFeeTooltip(fee.tooltip), fee.label, fee.mobileLabel)}</td>
							{#each returnPeriods as period (period.label)}
								<td aria-label={`${fee.label} for ${period.label}`}>
									{#if isMissingFeeValue(fee.value)}
										{@render noDataCell()}
									{:else}
										{formatPercent(fee.value)}
									{/if}
								</td>
							{/each}
						</tr>
					{/each}
					<tr>
						<td>
							{@render metricLabel(
								withInternalisedFeeTooltip(
									'<strong>Net returns</strong> are annualised. They are the gross returns after all investor-facing fees have been deducted.'
								),
								'Net'
							)}
						</td>
						{#each returnPeriods as period (period.label)}
							<td>
								{#if isNetReturnUnavailable(period)}
									{@render noDataCell()}
								{:else}
									<Tooltip>
										<span slot="trigger" class="return-cell">{formatPercentProfit(period.net.annualised)}</span>
										<svelte:fragment slot="popup">
											<dl class="return-tooltip">
												<div>
													<dt>Annualised:</dt>
													<dd>{formatPercentProfit(period.net.annualised)}</dd>
												</div>
												<div>
													<dt>Raw:</dt>
													<dd>{formatPercentProfit(period.net.raw)}</dd>
												</div>
												<div>
													<dt>Sampled period:</dt>
													<dd>{getSamplePeriodLabel(period)}</dd>
												</div>
											</dl>
										</svelte:fragment>
									</Tooltip>
								{/if}
							</td>
						{/each}
					</tr>
				</tbody>
			</table>
		</div>
		{#if hasInternalisedFees}
			<p class="fee-disclaimer">{INTERNALISED_FEE_DISCLAIMER}</p>
		{/if}
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

			:global(:is(.other-metrics, .transaction-status, .performance)) {
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
			min-width: 44rem;
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

			@media (--viewport-sm-down) {
				:is(th, td):first-child {
					width: 8.75rem;
					min-width: 8.75rem;
					white-space: nowrap;
				}

				td:first-child [slot='trigger'] {
					min-width: 0;
				}
			}
		}

		.table-scroll {
			overflow-x: auto;
		}

		.fee-disclaimer {
			margin: 0.75rem 0 0;
			font: var(--f-ui-sm-roman);
			color: var(--c-text-light);
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

		.return-cell {
			border-bottom: 1px dotted var(--c-text-light);
		}

		.no-data-cell {
			border-bottom: 1px dotted var(--c-text-light);
		}

		.no-data-tooltip :global(.popup) {
			max-width: 200px;
		}

		.return-tooltip {
			display: grid;
			gap: 0.35rem;
			margin: 0;

			div {
				display: grid;
				grid-template-columns: max-content 1fr;
				gap: 0.75rem;
			}

			dt {
				color: var(--c-text-light);
			}

			dd {
				margin: 0;
				text-align: right;
				font-weight: 500;
			}
		}

		.label-mobile {
			display: none;
		}

		@media (--viewport-sm-down) {
			.label-desktop {
				display: none;
			}

			.label-mobile {
				display: inline;
			}
		}

		.risk-link,
		a.denomination-link,
		.glossary-link {
			text-decoration: underline;
			text-decoration-style: dashed;
		}

		.denomination-link {
			display: inline-flex;
			align-items: center;
			gap: 0.4em;
		}

		.denomination-logo {
			width: 1.2em;
			height: 1.2em;
			border-radius: 999px;
			object-fit: contain;
		}
	}
</style>
