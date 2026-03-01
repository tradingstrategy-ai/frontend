<!--
Overview page for YAML-configured strategies — displays vault metrics and a link to the vault detail page.
-->
<script lang="ts">
	import type { VaultInfo } from '$lib/top-vaults/schemas';
	import { getVaultSparklineUrl, resolveVaultDetails } from '$lib/top-vaults/helpers';
	import { formatDollar, formatNumber, formatPercent } from '$lib/helpers/formatters';
	import { getLogoUrl } from '$lib/helpers/assets';
	import { Button, Markdown } from '$lib/components';

	export let data;

	$: ({ strategy, vaultInfo, chain } = data);

	$: vaultDetailUrl = vaultInfo ? resolveVaultDetails(vaultInfo) : undefined;
	$: sparklineUrl = vaultInfo ? getVaultSparklineUrl(vaultInfo) : undefined;
</script>

{#if vaultInfo}
	<section class="vault-overview">
		{#if sparklineUrl}
			<div class="chart">
				<img src={sparklineUrl} alt="90-day performance chart" />
			</div>
		{/if}

		<div class="metrics">
			<div class="metric">
				<span class="label">TVL</span>
				<span class="value">{formatDollar(vaultInfo.current_nav, 1)}</span>
			</div>

			{#if vaultInfo.one_month_cagr_net != null}
				<div class="metric">
					<span class="label">1M return (annualised)</span>
					<span
						class="value"
						class:positive={vaultInfo.one_month_cagr_net > 0}
						class:negative={vaultInfo.one_month_cagr_net < 0}
					>
						{formatPercent(vaultInfo.one_month_cagr_net)}
					</span>
				</div>
			{/if}

			{#if vaultInfo.three_months_cagr_net != null}
				<div class="metric">
					<span class="label">3M return (annualised)</span>
					<span
						class="value"
						class:positive={vaultInfo.three_months_cagr_net > 0}
						class:negative={vaultInfo.three_months_cagr_net < 0}
					>
						{formatPercent(vaultInfo.three_months_cagr_net)}
					</span>
				</div>
			{/if}

			{#if vaultInfo.three_months_sharpe != null}
				<div class="metric">
					<span class="label">3M Sharpe</span>
					<span class="value">{formatNumber(vaultInfo.three_months_sharpe, 2)}</span>
				</div>
			{/if}

			{#if vaultInfo.mgmt_fee != null}
				<div class="metric">
					<span class="label">Management fee</span>
					<span class="value">{formatPercent(vaultInfo.mgmt_fee)}</span>
				</div>
			{/if}

			{#if vaultInfo.perf_fee != null}
				<div class="metric">
					<span class="label">Performance fee</span>
					<span class="value">{formatPercent(vaultInfo.perf_fee)}</span>
				</div>
			{/if}

			{#if chain}
				<div class="metric">
					<span class="label">Chain</span>
					<span class="value chain">
						<img class="chain-icon" src={getLogoUrl('blockchain', chain.slug)} alt={chain.name} />
						{chain.name}
					</span>
				</div>
			{/if}
		</div>

		{#if vaultDetailUrl}
			<div class="vault-link">
				<Button href={vaultDetailUrl}>View vault details</Button>
			</div>
		{/if}
	</section>
{:else}
	<p class="no-vault">Vault data is currently unavailable.</p>
{/if}

{#if strategy.long_description}
	<section class="description">
		<h2>About this strategy</h2>
		<Markdown content={strategy.long_description} />
	</section>
{/if}

<style>
	.vault-overview {
		display: grid;
		gap: var(--space-lg);
	}

	.chart {
		border-radius: var(--radius-md);
		overflow: hidden;
		background: var(--c-box-1);

		img {
			display: block;
			width: 100%;
			height: auto;
		}
	}

	.metrics {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
		gap: var(--space-md);
	}

	.metric {
		display: grid;
		gap: var(--space-xxs);

		.label {
			font: var(--f-ui-sm-medium);
			letter-spacing: var(--f-ui-sm-spacing, normal);
			color: var(--c-text-extra-light);
		}

		.value {
			font: var(--f-ui-xl-medium);
			letter-spacing: var(--f-ui-xl-spacing, normal);

			&.positive {
				color: var(--c-bull);
			}

			&.negative {
				color: var(--c-bear);
			}
		}

		.chain {
			display: flex;
			align-items: center;
			gap: var(--space-ss);
		}

		.chain-icon {
			height: 1.25rem;
			width: 1.25rem;
			border-radius: 100%;
		}
	}

	.vault-link {
		display: flex;
	}

	.no-vault {
		color: var(--c-text-extra-light);
		font: var(--f-ui-lg-roman);
	}

	.description {
		margin-top: var(--space-xl);

		h2 {
			font: var(--f-heading-md-medium);
			letter-spacing: var(--f-heading-md-spacing, normal);
			margin-bottom: var(--space-md);
		}
	}
</style>
