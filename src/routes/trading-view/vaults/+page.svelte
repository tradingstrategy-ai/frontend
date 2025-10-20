<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import Timestamp from '$lib/components/Timestamp.svelte';
	import { getChain } from '$lib/helpers/chain';
	import {
		formatAmount,
		formatDollar,
		formatNumber,
		formatPercent,
		formatShortAddress,
		formatValue
	} from '$lib/helpers/formatters';

	const { data } = $props();
	const { topVaults } = data;
</script>

<svelte:head>
	<title>Top vaults | Trading Strategy</title>
	<meta name="description" content="Browse the highest performing vaults across all supported blockchains." />
</svelte:head>

<main class="top-vaults ds-3">
	{#if !topVaults.rows.length}
		<Section padding="sm">
			<p>No vault data available.</p>
		</Section>
	{:else}
		<Section padding="sm" class="vaults-table">
			<div class="page-header">
				<h1 class="page-title">The best-performing vaults on each chain</h1>
				<p class="page-subtitle">Minimum $50k USD TVL</p>
				<p class="page-subtitle">
					Updated <Timestamp date={topVaults.generated_at} relative />
				</p>
			</div>

			<header class="table-header">
				<div class="totals">
					<span>Total current TVL {formatDollar(topVaults.current_tvl_usd, 2, 2)}</span>
					<span>Peak TVL {formatDollar(topVaults.peak_tvl_usd, 2, 2)}</span>
					<span>Total vaults {topVaults.rows.length}</span>
				</div>
			</header>

			<div class="table-wrapper">
				<table>
					<thead>
						<tr>
							<th>Vault</th>
							<th>Chain</th>
							<th>1M return</th>
							<th>1M return (ann.)</th>
							<th>3M return (ann.)</th>
							<th>3M Sharpe</th>
							<th>Lifetime return (ann.)</th>
							<th>Current TVL (USD)</th>
							<th>Age (years)</th>
							<th>Denomination</th>
							<th>Peak TVL (USD)</th>
							<th>3M return</th>
							<th>Lifetime return</th>
							<th>3M volatility</th>
							<th>Deposits/Redeems</th>
							<th>Mgmt fee</th>
							<th>Perf fee</th>
							<th>First deposit</th>
							<th>Last deposit</th>
							<th>Vault address</th>
							<th>Vault ID</th>
						</tr>
					</thead>
					<tbody>
						{#each topVaults.rows as vault (vault.id)}
							{@const chain = getChain(vault.chain)}
							<tr>
								<td>
									<div class="vault-name">
										<strong>{vault.name}</strong>
										{#if vault.protocol}
											<span class="protocol">{vault.protocol}</span>
										{/if}
									</div>
								</td>
								<td>
									{#if chain}
										<a class="chain-link" href={`/trading-view/${chain.slug}`}>{chain.name}</a>
									{:else}
										Chain {vault.chain}
									{/if}
								</td>
								<td>{formatPercent(vault['1m_return'], 2)}</td>
								<td>{formatPercent(vault['1m_return_ann'], 2)}</td>
								<td>{formatPercent(vault['3m_return_ann'], 2)}</td>
								<td>{formatNumber(vault['3m_sharpe'])}</td>
								<td>{formatPercent(vault.lifetime_return_ann, 2)}</td>
								<td>{formatDollar(vault.current_tvl_usd, 2, 2)}</td>
								<td>{formatNumber(vault.age_years, 2, 4)}</td>
								<td>{formatValue(vault.denomination)}</td>
								<td>{formatDollar(vault.peak_tvl_usd, 2, 2)}</td>
								<td>{formatPercent(vault['3m_return'], 2)}</td>
								<td>{formatPercent(vault.lifetime_return, 2)}</td>
								<td>{formatPercent(vault['3m_volatility'], 4)}</td>
								<td>{formatAmount(vault.deposit_redeem_count)}</td>
								<td>{formatPercent(vault.management_fee, 1)}</td>
								<td>{formatPercent(vault.performance_fee, 1)}</td>
								<td><Timestamp date={vault.first_deposit} withTime /> UTC</td>
								<td><Timestamp date={vault.last_deposit} withTime /> UTC</td>
								<td class="address-cell" title={vault.address}>{formatShortAddress(vault.address)}</td>
								<td class="id-cell" title={vault.id}>{vault.id}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</Section>
	{/if}
</main>

<style>
	.top-vaults {
		display: grid;
		gap: 0.5rem;
		padding-bottom: 1rem;
	}

	.page-header {
		display: grid;
		gap: var(--space-xs);
		max-width: 70ch;
	}

	.page-title {
		font-size: 1.9rem;
		font-weight: 600;
		color: var(--c-text);
		margin: 0;
	}

	.page-subtitle {
		font-size: 1rem;
		color: var(--c-text-light);
		font-weight: 500;
		margin: 0;
	}

	.vaults-table {
		display: grid;
		gap: 1.5rem;
	}

	.table-header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		flex-wrap: wrap;
		gap: var(--space-sm);
	}

	.totals {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-md);
		color: var(--c-text-extra-light);
		font: var(--f-ui-sm-roman);
		margin-top: 1rem;
	}

	.table-wrapper {
		width: 100%;
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		min-width: 1200px;
	}

	th,
	td {
		text-align: left;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--c-box-4);
		vertical-align: top;
	}

	th {
		font: var(--f-ui-xs-medium);
		letter-spacing: var(--ls-ui-xs);
		text-transform: uppercase;
		color: var(--c-text-light);
		background: color-mix(in srgb, var(--c-box-1), var(--c-box-2) 40%);
		position: sticky;
		top: 0;
	}

	td {
		font: var(--f-ui-sm-roman);
		letter-spacing: var(--ls-ui-sm, normal);
	}

	tr:nth-child(even) td {
		background: color-mix(in srgb, var(--c-box-1), var(--c-box-2) 20%);
	}

	.vault-name {
		display: grid;
		gap: 0.25rem;
	}

	.protocol {
		font: var(--f-ui-xs-medium);
		letter-spacing: 0.02em;
		color: var(--c-text-light);
		text-transform: uppercase;
	}

	.chain-link {
		color: inherit;
		text-decoration: none;

		&:hover {
			text-decoration: underline;
		}
	}

	.address-cell,
	.id-cell {
		font-family: var(
			--monospace,
			ui-monospace,
			SFMono-Regular,
			SFMono,
			Menlo,
			Monaco,
			Consolas,
			'Liberation Mono',
			'Courier New',
			monospace
		);
	}

	@media (--viewport-sm-down) {
		table {
			min-width: 1024px;
		}
	}
</style>
