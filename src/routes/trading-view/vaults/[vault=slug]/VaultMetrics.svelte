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
	import { getFormattedLockup, isGoodVaultStatus } from '$lib/top-vaults/helpers';
	import { formatNumber, formatPercent, formatPercentProfit } from '$lib/helpers/formatters';
	import { getChain } from '$lib/helpers/chain';
	import { getStablecoinLogoUrl, resolveStablecoinSlug } from '$lib/stablecoin-metadata/helpers';
	import type { StablecoinMetadata } from '$lib/stablecoin-metadata/schemas';

	interface Props {
		vault: VaultInfo;
		stablecoinMetadata?: StablecoinMetadata | null;
	}

	const LIMITED_HISTORY_CHAINS = [9999, 9998, 9997];

	let { vault, stablecoinMetadata = null }: Props = $props();

	let chain = $derived(getChain(vault.chain_id));
	let hasLimitedHistory = $derived(LIMITED_HISTORY_CHAINS.includes(vault.chain_id));
	let showTransactionStatus = $derived(!isGoodVaultStatus(vault));
	let denominationSlug = $derived(
		resolveStablecoinSlug({
			slug: vault.denomination_slug,
			symbol: vault.denomination,
			name: vault.normalised_denomination
		})
	);
	let denominationLogoUrl = $derived(
		stablecoinMetadata?.logos.light && denominationSlug ? getStablecoinLogoUrl(denominationSlug) : undefined
	);
	let denominationHref = $derived(
		stablecoinMetadata && denominationSlug ? `/trading-view/vaults/stablecoins/${denominationSlug}` : undefined
	);

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
		{ label: '1M', gross: vault.one_month_returns, net: vault.one_month_returns_net },
		{ label: '3M', gross: vault.three_months_returns, net: vault.three_months_returns_net },
		{
			label: '6M',
			gross: periodResults.get('6m')?.returns_gross ?? null,
			net: periodResults.get('6m')?.returns_net ?? null
		},
		{
			label: '1Y',
			gross: periodResults.get('1y')?.returns_gross ?? null,
			net: periodResults.get('1y')?.returns_net ?? null
		},
		{ label: 'Lifetime', gross: vault.lifetime_return, net: vault.lifetime_return_net }
	]);
	let feeRows = $derived([
		{
			label: 'Performance fee',
			mobileLabel: 'Performance',
			value: vault.net_fees?.performance,
			tooltip: '<strong>Performance fee</strong> is charged against investment profits.'
		},
		{
			label: 'Management fee',
			mobileLabel: 'Management',
			value: vault.net_fees?.management,
			tooltip: '<strong>Management fee</strong> is charged annually for managing the vault.'
		},
		{
			label: 'Deposit fee',
			mobileLabel: 'Deposit',
			value: vault.net_fees?.deposit,
			tooltip: '<strong>Deposit fee</strong> is a one-time fee applied when entering the vault.'
		},
		{
			label: 'Withdrawal fee',
			mobileLabel: 'Withdrawal',
			value: vault.net_fees?.withdraw,
			tooltip: '<strong>Withdrawal fee</strong> is a one-time fee applied when exiting the vault.'
		}
	]);
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
				{#if denominationHref}
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
						{#each returnPeriods as period}
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
					<tr>
						<td>
							{@render metricLabel(
								'<strong>Gross returns</strong> reflect the change in the vault share price before investor-facing fees are deducted.',
								'Gross'
							)}
						</td>
						{#each returnPeriods as period}
							<td>{formatPercentProfit(period.gross)}</td>
						{/each}
					</tr>
					{#each feeRows as fee}
						<tr class="fee-row">
							<td>{@render metricLabel(fee.tooltip, fee.label, fee.mobileLabel)}</td>
							{#each returnPeriods as _}
								<td>{formatPercent(fee.value)}</td>
							{/each}
						</tr>
					{/each}
					<tr>
						<td>
							{@render metricLabel(
								'<strong>Net returns</strong> are the gross returns after all investor-facing fees have been deducted.',
								'Net'
							)}
						</td>
						{#each returnPeriods as period}
							<td>{formatPercentProfit(period.net)}</td>
						{/each}
					</tr>
				</tbody>
			</table>
		</div>
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
