<script lang="ts">
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import Section from '$lib/components/Section.svelte';
	import CryptoAddressWidget from '$lib/components/CryptoAddressWidget.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import VaultPriceChart from '$lib/top-vaults/VaultPriceChart.svelte';
	import { getChain, getExplorerUrl } from '$lib/helpers/chain.js';
	import { formatDollar, formatPercent } from '$lib/helpers/formatters.js';
	import MetricsBox from '$lib/components/MetricsBox.svelte';
	import Profitability from '$lib/components/Profitability.svelte';

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
		<div class="chart-area">
			<VaultPriceChart {vault} />
			<div class="featured-metrics">
				<MetricsBox>
					<dl>
						<dt>1M return (ann)</dt>
						<dd><Profitability of={vault.cagr} /></dd>
					</dl>
				</MetricsBox>
				<MetricsBox>
					<dl>
						<dt>Total value locked</dt>
						<dd>{formatDollar(vault.current_nav)}</dd>
					</dl>
				</MetricsBox>
			</div>
		</div>

		<div class="returns">
			<h4>Vault Returns</h4>

			<table>
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
		</div>
	</Section>
</main>

<style>
	.vault-details {
		:global(.vault-address) {
			max-width: 15rem;
		}

		:global(.content) {
			display: grid;
			gap: 2rem;
		}

		:global(h4) {
			font: var(--f-ui-sm-medium);
			letter-spacing: 0.05em;
			color: var(--c-text-extra-light);
			text-transform: uppercase;
		}

		.chart-area {
			display: grid;
			grid-template-columns: 1fr 16rem;
			gap: 1.75rem;

			.featured-metrics {
				display: grid;
				gap: inherit;
				align-content: start;
			}
		}

		dl {
			display: grid;
			gap: 1rem;
			grid-template-rows: auto 1fr;

			dt {
				font: var(--f-ui-md-medium);
				color: var(--c-text-light);
			}

			dd {
				font: var(--f-heading-xxl-medium);
				justify-self: end;
				display: grid;
			}
		}

		.returns {
			background: var(--c-box-1);
			border: 1px solid var(--c-box-3);
			border-radius: 1.25rem;
			padding: 1.75rem;

			table {
				width: 100%;
				border-collapse: collapse;
				font: var(--f-ui-md-roman);
			}

			th {
				border-bottom: 2px solid var(--c-text-extra-light);
			}

			td {
				border-bottom: 1px solid var(--c-text-extra-light);
			}

			:is(th, td) {
				padding: 0.5rem;

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
