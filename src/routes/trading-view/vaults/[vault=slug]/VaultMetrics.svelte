<script lang="ts">
	import type { VaultFees, VaultInfo } from '$lib/top-vaults/schemas';
	import MetricsBox from '$lib/components/MetricsBox.svelte';
	import Risk from '$lib/top-vaults/Risk.svelte';
	import Metric from './Metric.svelte';
	import { getFormattedFeeMode, getFormattedLockup } from '$lib/top-vaults/helpers';
	import { formatAmount, formatNumber, formatPercent } from '$lib/helpers/formatters';

	interface Props {
		vault: VaultInfo;
	}

	let { vault }: Props = $props();
</script>

<div class="additional-metrics">
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

			<Metric label="Age">
				{formatNumber(vault.years, 1)} years
			</Metric>

			<Metric label="Deposit events">
				{formatAmount(vault.event_count)}
			</Metric>

			<Metric label="Protocol Technical Risk">
				<Risk risk={vault.risk} />
			</Metric>

			<Metric label="Fee mode">
				{getFormattedFeeMode(vault)}
			</Metric>

			<Metric label="Lockup period">
				{getFormattedLockup(vault)}
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
				<tr>
					<td>Gross</td>
					<td>
						<span>{formatPercent(vault.one_month_cagr)}</span>
						<span>{formatPercent(vault.one_month_returns)}</span>
					</td>
					<td>
						<span>{formatPercent(vault.three_months_cagr)}</span>
						<span>{formatPercent(vault.three_months_returns)}</span>
					</td>
					<td>
						<span>{formatPercent(vault.cagr)}</span>
						<span>{formatPercent(vault.lifetime_return)}</span>
					</td>
				</tr>
				<tr>
					<td>Net</td>
					<td>
						<span>{formatPercent(vault.one_month_cagr_net)}</span>
						<span>{formatPercent(vault.one_month_returns_net)}</span>
					</td>
					<td>
						<span>{formatPercent(vault.three_months_cagr_net)}</span>
						<span>{formatPercent(vault.three_months_returns_net)}</span>
					</td>
					<td>
						<span>{formatPercent(vault.cagr_net)}</span>
						<span>{formatPercent(vault.lifetime_return_net)}</span>
					</td>
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
				{#snippet feeRow(label: string, fees: VaultFees | null)}
					<tr>
						<td>{label}</td>
						<td>{formatPercent(fees?.management)}</td>
						<td>{formatPercent(fees?.performance)}</td>
						<td>{formatPercent(fees?.deposit)}</td>
						<td>{formatPercent(fees?.withdraw)}</td>
					</tr>
				{/snippet}

				{@render feeRow('Gross', vault.gross_fees)}
				{@render feeRow('Net', vault.net_fees)}
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

			:global(:is(.other-metrics)) {
				grid-column: span 2;
			}
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
				color: var(--c-text-extra-light);
				font-size: 0.875em;
			}

			td {
				border-bottom: 1px solid var(--c-text-extra-light);
			}

			:is(th, td) {
				padding: var(--cell-padding);

				&:first-child {
					font-weight: 500;
				}

				&:not(:first-child) {
					text-align: right;
				}
			}

			td span {
				display: grid;
				grid-template-columns: 1fr 3ch;
				gap: 0.25rem;

				&:first-child::after {
					content: 'ann';
				}

				&:last-child {
					padding-top: 0.25em;
					color: var(--c-text-extra-light);
					&::after {
						content: 'abs';
					}
				}
			}
		}
	}
</style>
