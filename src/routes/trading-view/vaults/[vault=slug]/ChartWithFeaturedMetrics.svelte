<script lang="ts">
	import type { VaultInfo } from '$lib/top-vaults/schemas';
	import MetricsBox from '$lib/components/MetricsBox.svelte';
	import VaultPriceChart from '$lib/top-vaults/VaultPriceChart.svelte';
	import Profitability from '$lib/components/Profitability.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import Metric from './Metric.svelte';
	import { formatDollar, formatNumber, formatPercent, formatTokenAmount } from '$lib/helpers/formatters';
	import {
		getVaultCurrentTvlUsd,
		getVaultDenominationCurrency,
		getVaultPeakTvlUsd,
		getVaultTvlNative
	} from '$lib/top-vaults/helpers';

	interface Props {
		vault: VaultInfo;
		chartLogoUrl?: string;
	}

	let { vault, chartLogoUrl }: Props = $props();

	let denominationCurrency = $derived(getVaultDenominationCurrency(vault));
	let showNativeTvl = $derived(denominationCurrency != null && denominationCurrency !== 'usd');
	let currentNativeTvl = $derived(getVaultTvlNative(vault, vault.current_nav));
	let peakNativeTvl = $derived(getVaultTvlNative(vault, vault.peak_nav));
	let nativeTvlLabel = $derived.by(() => {
		if (!showNativeTvl || currentNativeTvl == null || !denominationCurrency) return null;

		const peak = peakNativeTvl == null ? '' : ` / ${formatNativeTvlAmount(peakNativeTvl)}`;
		return `(${formatNativeTvlAmount(currentNativeTvl)}${peak}) ${denominationCurrency.toUpperCase()}`;
	});

	function formatNativeTvlAmount(value: number | null): string {
		return value == null ? '' : formatTokenAmount(value, 2);
	}
</script>

<MetricsBox>
	<div class="chart-area">
		<VaultPriceChart {vault} {chartLogoUrl} />

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
				{formatDollar(getVaultCurrentTvlUsd(vault), 1)}
				<div class="sm">peak {formatDollar(getVaultPeakTvlUsd(vault), 1)}</div>
				{#if nativeTvlLabel}
					<div class="sm">{nativeTvlLabel}</div>
				{/if}
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
				font: var(--f-ui-lg-medium);
				color: var(--c-text-extra-light);
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
