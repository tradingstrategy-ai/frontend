<script lang="ts">
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import CryptoAddressWidget from '$lib/components/CryptoAddressWidget.svelte';
	import MetricsBox from '$lib/components/MetricsBox.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Profitability from '$lib/components/Profitability.svelte';
	import Section from '$lib/components/Section.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import VaultPriceChart from '$lib/top-vaults/VaultPriceChart.svelte';
	import Risk from '$lib/top-vaults/Risk.svelte';
	import Metric from './Metric.svelte';
	import { getChain, getExplorerUrl } from '$lib/helpers/chain.js';
	import { formatAmount, formatDollar, formatNumber, formatPercent } from '$lib/helpers/formatters.js';

	let { data } = $props();
	let { vault } = $derived(data);

	let chain = $derived(getChain(vault.chain_id));
</script>

<svelte:head>
	<title>{vault.name} | DeFi Vault | Trading Strategy</title>
	<meta name="description" content="Vault details for {vault.name} on {vault.protocol}" />
</svelte:head>

<Breadcrumbs labels={{ vaults: 'Top Vaults', [vault.id]: vault.name }} />

<main class="vault-details ds-3">
	<PageHeader title={vault.name} subtitle={vault.protocol}>
		{#snippet cta()}
			<CryptoAddressWidget
				size="md"
				class="vault-address"
				address={vault.address}
				href={getExplorerUrl(chain, vault.address)}
			/>
		{/snippet}
	</PageHeader>

	<Section padding="md" class="content">
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
									<Profitability of={vault.one_month_cagr} />
									<span class="sm">(G)</span>
								</span>
								<svelte:fragment slot="popup">
									Fee information for this protocol is not yet available. The calculation is based on gross profit and
									fees may apply.
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

		<div class="additional-metrics">
			<MetricsBox class="other-metrics" title="Other metrics">
				<div class="other-metrics-inner">
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
			</MetricsBox>

			<MetricsBox class="fees" title="Fees" --padding="1.75rem">
				<div class="fees-inner">
					<Metric label="Management fee">{formatPercent(vault.mgmt_fee, 1)}</Metric>
					<Metric label="Performance fee">{formatPercent(vault.perf_fee, 1)}</Metric>
				</div>
			</MetricsBox>
		</div>
	</Section>
</main>

<style>
	.vault-details {
		:is(.desktop, .mobile) {
			display: contents;
		}

		@media (--viewport-sm-down) {
			.desktop {
				display: none;
			}

			--padding: 1.25rem;
			--gap: 1.5rem;
		}

		@media (--viewport-md-up) {
			--padding: 1.75rem;
			--gap: 2rem;

			.mobile {
				display: none;
			}
		}

		:global(.vault-address) {
			max-width: 15rem;
		}

		:global(.content) {
			display: grid;
			gap: var(--gap);
		}

		:global(h4) {
			font: var(--f-ui-sm-medium);
			letter-spacing: 0.05em;
			color: var(--c-text-extra-light);
			text-transform: uppercase;
		}

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
			}

			.other-metrics-inner {
				display: flex;
				flex-wrap: wrap;
				justify-content: space-between;
				gap: var(--gap);
			}

			.fees-inner {
				display: flex;
				gap: var(--gap);
			}
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
</style>
