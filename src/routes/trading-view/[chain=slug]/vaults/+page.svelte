<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import {
		formatDollar,
		formatPercent,
		formatNumber,
		formatDatetime,
		formatShortAddress
	} from '$lib/helpers/formatters';

	type Vault = {
		id: string;
		name: string;
		protocol?: string | null;
		denomination?: string | null;
		management_fee?: number | null;
		performance_fee?: number | null;
		current_tvl_usd?: number | null;
		peak_tvl_usd?: number | null;
		'1m_return'?: number | null;
		'1m_return_ann'?: number | null;
		'3m_return'?: number | null;
		'3m_return_ann'?: number | null;
		'3m_sharpe'?: number | null;
		'3m_volatility'?: number | null;
		lifetime_return?: number | null;
		lifetime_return_ann?: number | null;
		age_years?: number | null;
		deposit_redeem_count?: number | null;
		first_deposit?: string | null;
		last_deposit?: string | null;
		address?: string | null;
	};

	type ChainInfo = {
		id: number;
		name: string;
		slug: string;
		gas: string;
		explorer?: string;
	};

	const { data } = $props();
	const { generatedAt, chain, vaults, totalTvlUsd, totalPeakTvlUsd } = data as {
		generatedAt: string;
		chain: ChainInfo;
		vaults: Vault[];
		totalTvlUsd: number;
		totalPeakTvlUsd: number;
	};

	function formatPercentValue(value: number | null | undefined, digits = 2) {
		return formatPercent(value ?? undefined, digits, digits);
	}

	function formatNumberValue(value: number | null | undefined, digits = 2, precision = digits) {
		return formatNumber(value ?? undefined, digits, precision);
	}

	function formatDateTime(value: string | null | undefined) {
		return formatDatetime(value ? new Date(value) : undefined);
	}

	const generatedTimestamp = generatedAt ? formatDatetime(new Date(generatedAt)) : '---';
	const chainName = chain?.name ?? 'Selected chain';
</script>

<svelte:head>
	<title>{chainName} vaults | Trading Strategy</title>
	<meta name="description" content={`Top vaults on ${chainName} ranked by TVL.`} />
</svelte:head>

<main class="chain-vaults ds-3">
	<Section padding="lg">
		<h1>{chainName} vaults</h1>
		<p class="meta">Data generated {generatedTimestamp}</p>
		<p class="meta">
			Showing vaults currently tracked on {chainName}, sorted by total value locked (TVL). Switch to other
			blockchains via the trading view navigation.
		</p>
		<div class="totals">
			<span>Total chain TVL {formatDollar(totalTvlUsd, 2, 2)}</span>
			<span>Peak chain TVL {formatDollar(totalPeakTvlUsd, 2, 2)}</span>
			<span>Vaults listed {vaults.length}</span>
		</div>
	</Section>

	{#if vaults.length === 0}
		<Section padding="md">
			<p>No vault data available for {chainName}.</p>
		</Section>
	{:else}
		<Section padding="md">
			<div class="table-wrapper">
				<table>
					<thead>
						<tr>
							<th>#</th>
							<th>Vault</th>
							<th>Protocol</th>
							<th>Denomination</th>
							<th>TVL (USD)</th>
							<th>Peak TVL (USD)</th>
							<th>Return 1m</th>
							<th>Return 1m (ann.)</th>
							<th>Return 3m</th>
							<th>Return 3m (ann.)</th>
							<th>Return lifetime</th>
							<th>Return lifetime (ann.)</th>
							<th>3m Sharpe</th>
							<th>3m Volatility</th>
							<th>Age (years)</th>
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
						{#each vaults as vault, idx}
							<tr>
								<td>{idx + 1}</td>
								<td>
									<div class="vault-name">
										<strong>{vault.name}</strong>
									</div>
								</td>
								<td>{vault.protocol ?? '---'}</td>
								<td>{vault.denomination ?? '---'}</td>
								<td>{formatDollar(vault.current_tvl_usd ?? 0, 2, 2)}</td>
								<td>{formatDollar(vault.peak_tvl_usd ?? 0, 2, 2)}</td>
								<td>{formatPercentValue(vault['1m_return'])}</td>
								<td>{formatPercentValue(vault['1m_return_ann'])}</td>
								<td>{formatPercentValue(vault['3m_return'])}</td>
								<td>{formatPercentValue(vault['3m_return_ann'])}</td>
								<td>{formatPercentValue(vault.lifetime_return)}</td>
								<td>{formatPercentValue(vault.lifetime_return_ann)}</td>
								<td>{formatNumberValue(vault['3m_sharpe'])}</td>
								<td>{formatPercentValue(vault['3m_volatility'], 4)}</td>
								<td>{formatNumberValue(vault.age_years, 2, 4)}</td>
								<td>{vault.deposit_redeem_count?.toLocaleString('en-US') ?? '---'}</td>
								<td>{formatPercentValue(vault.management_fee)}</td>
								<td>{formatPercentValue(vault.performance_fee)}</td>
								<td>{formatDateTime(vault.first_deposit)}</td>
								<td>{formatDateTime(vault.last_deposit)}</td>
								<td class="address-cell" title={vault.address ?? undefined}>
									{vault.address ? formatShortAddress(vault.address) : '---'}
								</td>
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
	.chain-vaults {
		display: grid;
		gap: 2.5rem;
		padding-bottom: 4rem;
	}

	.meta {
		color: var(--c-text-extra-light);
		margin-top: 0.25rem;
	}

	.totals {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		margin-top: 1rem;
		color: var(--c-text-extra-light);
		font: var(--f-ui-sm-roman);
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
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.address-cell,
	.id-cell {
		font-family: var(--monospace, ui-monospace, SFMono-Regular, SFMono, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace);
	}

	@media (--viewport-sm-down) {
		table {
			min-width: 1024px;
		}
	}
</style>
