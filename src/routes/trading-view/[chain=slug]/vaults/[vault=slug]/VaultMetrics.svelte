<script lang="ts">
	import type { VaultInfo } from '$lib/top-vaults/schemas';
	import MetricsBox from '$lib/components/MetricsBox.svelte';
	import Risk from '$lib/top-vaults/Risk.svelte';
	import Metric from './Metric.svelte';
	import { getFormattedLockup } from '$lib/top-vaults/helpers';
	import { formatAmount, formatNumber, formatPercent, isNumber } from '$lib/helpers/formatters';

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

			<Metric label="Age">{formatNumber(vault.years, 1)} years</Metric>
			<Metric label="Deposit events">{formatAmount(vault.event_count)}</Metric>
			<Metric label="Protocol Technical Risk">
				<Risk risk={vault.risk} />
			</Metric>
		</div>
	</MetricsBox>

	<MetricsBox class="returns" title="Returns">
		<table class="returns-table">
			<thead>
				<tr>
					<th></th>
					<th>1 month</th>
					<th>3 month</th>
					<th>1 year</th>
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
		<div class="net-fee-info">
			{#if isNumber(vault.mgmt_fee) && isNumber(vault.perf_fee)}
				Net returns are calculated based on gross returns after accounting for fees.
			{:else}
				Net returns cannot be calculated because fee information is not yet available for this protocol.
			{/if}
		</div>
	</MetricsBox>

	<MetricsBox class="fees" title="Fees / lockup">
		<div class="metrics-inner">
			<Metric label="Management fee">{formatPercent(vault.mgmt_fee, 1)}</Metric>
			<Metric label="Performance fee">{formatPercent(vault.perf_fee, 1)}</Metric>
			<Metric label="Lockup period">{getFormattedLockup(vault)}</Metric>
		</div>
	</MetricsBox>

	<MetricsBox class="notes" title="Notes">
		<div class={['notes-inner', !vault.notes && 'empty']}>
			{#if vault.notes}
				{vault.notes}
			{:else}
				No notes available.
			{/if}
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

			:global(.fees) {
				grid-area: 1 / 1;
			}

			:global(.fees) {
				grid-area: 2 / 1;
			}

			:global(.returns) {
				grid-area: span 2 / 2;
			}

			:global(.notes) {
				grid-column: span 2;
			}
		}

		.metrics-inner {
			display: flex;
			flex-wrap: wrap;
			justify-content: space-between;
			gap: var(--gap);
		}

		.returns-table {
			width: 100%;
			border-collapse: collapse;
			font: var(--f-ui-md-roman);
			--cell-padding: 0.5rem;

			@media (--viewport-sm-down) {
				font: var(--f-ui-sm-roman);
				--cell-padding: 0.5rem 0.25rem;
			}

			th {
				border-bottom: 2px solid var(--c-text-extra-light);
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

		.net-fee-info {
			margin-top: 1rem;
			font: var(--f-ui-md-roman);
			color: var(--c-text-extra-light);

			@media (--viewport-sm-down) {
				font: var(--f-ui-sm-roman);
			}
		}

		.notes-inner {
			font: var(--f-ui-lg-roman);

			&.empty {
				color: var(--c-text-extra-light);
			}
		}
	}
</style>
