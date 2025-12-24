<script lang="ts">
	import type { VaultInfo } from '$lib/top-vaults/schemas';
	import MetricsBox from '$lib/components/MetricsBox.svelte';
	import VaultPriceChart from '$lib/top-vaults/VaultPriceChart.svelte';
	import Profitability from '$lib/components/Profitability.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import Metric from './Metric.svelte';
	import { formatDollar, formatNumber, formatPercent } from '$lib/helpers/formatters';

	interface Props {
		vault: VaultInfo;
	}

	let { vault }: Props = $props();
</script>

<MetricsBox>
	<div class="chart-area">
		<VaultPriceChart {vault} />

		<div class="divider"></div>

		<div class="featured-metrics">
			<Metric size="xl" label="1M return (ann)">
				{#if vault.one_month_cagr_net}
					<Profitability of={vault.one_month_cagr_net} />
				{:else}
					<Tooltip>
						<span slot="trigger" style:white-space="nowrap">
							<Profitability of={vault.one_month_cagr} /><span class="gross-indicator">*</span>
						</span>
						<svelte:fragment slot="popup">
							Fee information for this protocol is not yet available. The calculation is based on gross profit and fees
							may apply.
						</svelte:fragment>
					</Tooltip>
				{/if}
			</Metric>
			<Metric size="xl" label="Total value locked">
				{formatDollar(vault.current_nav, 1)}
				<div class="sm">peak {formatDollar(vault.peak_nav, 1)}</div>
			</Metric>
			<div class="desktop">
				<Metric size="lg" label="3M Sharpe">
					{formatNumber(vault.three_months_sharpe, 1)}
				</Metric>
				<Metric size="lg" label="3M volatility">
					{formatPercent(vault.three_months_volatility, 1)}
				</Metric>
			</div>
		</div>
	</div>
</MetricsBox>

<style>
	.chart-area {
		display: grid;
		grid-template-columns: 1fr auto auto;
		gap: 1.75rem;

		.divider {
			width: 2px;
			background: var(--c-box-3);
		}

		.featured-metrics {
			display: grid;
			align-content: space-evenly;
			gap: var(--gap);
			padding-inline: 0.75rem;
			text-align: center;

			.gross-indicator {
				color: var(--c-text-light);
			}

			.sm {
				font: var(--f-heading-xs-roman);
				color: var(--c-text-light);
			}
		}

		@media (--viewport-md-down) {
			grid-template-columns: auto;

			.divider {
				display: none;
			}

			.featured-metrics {
				grid-row: 1;
				display: flex;
				justify-content: space-between;
			}
		}

		@media (--viewport-sm-down) {
			.featured-metrics {
				justify-content: space-evenly;
			}
		}
	}
</style>
