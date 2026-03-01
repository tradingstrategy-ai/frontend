<!--
Overview page for YAML-configured strategies — displays vault metrics and interactive price chart.
-->
<script lang="ts">
	import VaultPriceChart from '$lib/top-vaults/VaultPriceChart.svelte';
	import { formatDollar, formatNumber } from '$lib/helpers/formatters';
	import { getLogoUrl } from '$lib/helpers/assets';
	import MetricsBox from '$lib/components/MetricsBox.svelte';
	import Profitability from '$lib/components/Profitability.svelte';
	import { Button, Tooltip } from '$lib/components';
	import IconQuestionCircle from '~icons/local/question-circle';

	export let data;

	$: ({ strategy, vaultInfo, chain } = data);

	$: startDate = vaultInfo?.start_date ? new Date(vaultInfo.start_date) : undefined;
	$: ageDays = startDate ? Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24)) : undefined;
</script>

<svelte:head>
	<title>{strategy.name} | Trading Strategy</title>
	<meta name="description" content={strategy.short_description} />
</svelte:head>

{#if vaultInfo}
	<div class="strategy-overview">
		{#if strategy.external_url}
			<div class="my-deposits">
				<h2>My deposits</h2>
				<div class="content">
					<p>Deposit and redemptions are available on Hyperliquid app.</p>
					<Button href={strategy.external_url} target="_blank" rel="noreferrer">Deposit on Hyperliquid</Button>
				</div>
			</div>
		{/if}

		<VaultPriceChart vault={vaultInfo} />

		<div class="summary-metrics">
			<div class="metric-group primary">
				<MetricsBox>
					{#if vaultInfo.cagr_net != null}
						<div class="key-metric" data-css-props>
							<Tooltip>
								<div slot="trigger" class="label">
									Annual return
									<IconQuestionCircle />
								</div>
								<div slot="popup">Compounding Annual Growth Rate (CAGR) based on net vault returns.</div>
							</Tooltip>
							<div class="value">
								<Profitability of={vaultInfo.cagr_net} />
							</div>
						</div>
					{/if}
				</MetricsBox>

				<MetricsBox>
					<div class="key-metric" data-css-props>
						<Tooltip>
							<div slot="trigger" class="label">
								Total value locked
								<IconQuestionCircle />
							</div>
							<div slot="popup">Total assets currently deposited in the vault.</div>
						</Tooltip>
						<div class="value">{formatDollar(vaultInfo.current_nav)}</div>
					</div>
				</MetricsBox>
			</div>

			<MetricsBox title="Performance">
				<div class="metric-group secondary">
					{#if vaultInfo.one_month_cagr_net != null}
						<div class="key-metric" data-css-props>
							<Tooltip>
								<div slot="trigger" class="label">
									1M return
									<IconQuestionCircle />
								</div>
								<div slot="popup">Annualised return over the last month (net of fees).</div>
							</Tooltip>
							<div class="value">
								<Profitability of={vaultInfo.one_month_cagr_net} />
							</div>
						</div>
					{/if}

					{#if vaultInfo.three_months_cagr_net != null}
						<div class="key-metric" data-css-props>
							<Tooltip>
								<div slot="trigger" class="label">
									3M return
									<IconQuestionCircle />
								</div>
								<div slot="popup">Annualised return over the last three months (net of fees).</div>
							</Tooltip>
							<div class="value">
								<Profitability of={vaultInfo.three_months_cagr_net} />
							</div>
						</div>
					{/if}

					{#if ageDays != null}
						<div class="key-metric" data-css-props>
							<Tooltip>
								<div slot="trigger" class="label">
									Age
									<IconQuestionCircle />
								</div>
								<div slot="popup">Number of days since the vault started tracking data.</div>
							</Tooltip>
							<div class="value">{ageDays} days</div>
						</div>
					{/if}
				</div>
			</MetricsBox>

			<MetricsBox title="Risk metrics">
				<div class="metric-group secondary">
					{#if vaultInfo.three_months_sharpe != null}
						<div class="key-metric" data-css-props>
							<Tooltip>
								<div slot="trigger" class="label">
									Sharpe
									<IconQuestionCircle />
								</div>
								<div slot="popup">
									Sharpe Ratio measures risk-adjusted return over the last three months. Higher is better; above 1.0 is
									generally considered good.
								</div>
							</Tooltip>
							<div class="value">{formatNumber(vaultInfo.three_months_sharpe, 2)}</div>
						</div>
					{/if}

					{#if chain}
						<div class="key-metric" data-css-props>
							<div class="label">Chain</div>
							<div class="value chain-value">
								<img class="chain-icon" src={getLogoUrl('blockchain', chain.slug)} alt={chain.name} />
								{chain.name}
							</div>
						</div>
					{/if}
				</div>
			</MetricsBox>
		</div>
	</div>
{:else}
	<p class="no-vault">Vault data is currently unavailable.</p>
{/if}

<style>
	.strategy-overview {
		display: grid;
		gap: 1rem;
		align-items: flex-start;

		@media (--viewport-md-up) {
			gap: 1.5rem;
			grid-template-columns: 2fr minmax(17rem, 1fr);

			/* move deposit widget (1st element) to row 2, col 2 */
			> :global(:nth-child(1)) {
				grid-area: 2 / 2;
			}

			/* chart and metrics (even elements) span full row width */
			> :global(:nth-child(2n)) {
				grid-column: 1 / -1;
			}
		}
	}

	.my-deposits {
		display: grid;
		grid-template-rows: auto 1fr;
		border: 1px solid var(--c-text-light);
		border-radius: var(--radius-md);

		h2 {
			padding: 1.25rem 1.25rem 0.5rem;
			font: var(--f-heading-xs-medium);
			font-size: 1rem;
			letter-spacing: 0.06em;
			text-transform: uppercase;
			color: var(--c-text-ultra-light);
		}

		.content {
			display: grid;
			gap: 1rem;
			padding: 0.5rem 1.25rem 1.25rem;

			p {
				font: var(--f-ui-md-roman);
				letter-spacing: var(--ls-ui-md, normal);
				color: var(--c-text-light);
			}
		}
	}

	.summary-metrics {
		display: grid;
		gap: inherit;
		align-items: flex-start;

		.metric-group {
			display: flex;
			flex-wrap: wrap;
			gap: 1rem 1.5rem;
			justify-content: space-between;

			&.primary > :global(*) {
				flex: 1;
			}

			@media (--viewport-xs) {
				> :global(*) {
					flex: 1;
				}
			}
		}

		.primary [data-css-props] {
			--key-metric-gap: 0.5rem;
			--key-metric-label-font: var(--f-ui-md-medium);
			--key-metric-label-letter-spacing: var(--ls-ui-md);
			--key-metric-value-font: var(--f-heading-xxl-medium);
			--key-metric-value-letter-spacing: var(--ls-heading-xxl);

			@media (--viewport-lg-down) {
				--key-metric-value-font: var(--f-heading-xl-medium);
				--key-metric-value-letter-spacing: var(--ls-heading-xl);
			}

			@media (--viewport-xs) {
				--key-metric-label-font: var(--f-ui-sm-medium);
				--key-metric-label-letter-spacing: var(--ls-ui-sm);
				--key-metric-value-font: var(--f-heading-lg-medium);
				--key-metric-value-letter-spacing: var(--ls-heading-lg);
			}
		}

		.secondary [data-css-props] {
			--key-metric-label-font: var(--f-ui-sm-medium);
			--key-metric-label-letter-spacing: var(--ls-ui-sm);
			--key-metric-value-font: var(--f-ui-xxl-medium);
			--key-metric-value-letter-spacing: var(--ls-ui-xxl);

			@media (--viewport-sm-down) {
				--key-metric-value-font: var(--f-ui-xl-medium);
				--key-metric-value-letter-spacing: var(--ls-ui-xl);
			}

			@media (--viewport-xs) {
				--key-metric-label-font: var(--f-ui-xs-medium);
				--key-metric-label-letter-spacing: var(--ls-ui-xs);
				--key-metric-value-font: var(--f-ui-lg-medium);
				--key-metric-value-letter-spacing: var(--ls-ui-lg);
			}
		}
	}

	.key-metric {
		display: grid;
		gap: var(--key-metric-gap, 0.375rem);
		align-content: flex-start;
		white-space: nowrap;

		:global(.icon) {
			transform: translateY(-0.1em);
		}

		.label {
			font: var(--key-metric-label-font);
			letter-spacing: var(--key-metric-label-letter-spacing, normal);
			color: var(--c-text-light);
		}

		.value {
			font: var(--key-metric-value-font);
			letter-spacing: var(--key-metric-value-letter-spacing);
		}
	}

	.chain-value {
		display: flex;
		align-items: center;
		gap: var(--space-ss);
	}

	.chain-icon {
		height: 1.25rem;
		width: 1.25rem;
		border-radius: 100%;
	}

	.no-vault {
		color: var(--c-text-extra-light);
		font: var(--f-ui-lg-roman);
	}
</style>
