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

	type VaultGroup = {
		chainId: number;
		chainLabel: string;
		chainSlug: string;
		totalTvlUsd: number;
		totalPeakTvlUsd: number;
		vaults: Vault[];
	};

	const { data } = $props();
	const { generatedAt, groups } = data as {
		generatedAt: string;
		groups: VaultGroup[];
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
</script>

<svelte:head>
	<title>Top vaults by chain | Trading Strategy</title>
	<meta name="description" content="Browse the highest TVL strategy vaults on each supported blockchain." />
</svelte:head>

<main class="top-vaults ds-3">
	<Section padding="lg">
		<h1>Top vaults by chain</h1>
		<p class="meta">Data generated {generatedTimestamp}</p>
		<p class="meta">Ranked by current total value locked (TVL) in USD.</p>
	</Section>

	{#if !groups.length}
		<Section padding="md">
			<p>No vault data available.</p>
		</Section>
	{:else}
		{#each groups as group}
			<Section padding="md" class="vault-group">
				<header class="group-header">
					<h2>
						<a class="chain-link" href={`/trading-view/${group.chainSlug}/vaults`}>
							{group.chainLabel}
						</a>
					</h2>
					<div class="totals">
						<span>Total chain TVL {formatDollar(group.totalTvlUsd, 2, 2)}</span>
						<span>Peak chain TVL {formatDollar(group.totalPeakTvlUsd, 2, 2)}</span>
						<span>Vaults {group.vaults.length}</span>
					</div>
				</header>

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
							{#each group.vaults as vault, idx}
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
		{/each}
	{/if}
</main>

<style>
	.top-vaults {
		display: grid;
		gap: 2.5rem;
		padding-bottom: 4rem;
	}

	.meta {
		color: var(--c-text-extra-light);
		margin-top: 0.25rem;
	}

	.vault-group {
		display: grid;
		gap: 1.5rem;
	}

	.group-header {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.75rem;

		h2 {
			margin: 0;
			font: var(--f-heading-lg-medium);

			.chain-link {
				color: inherit;
				text-decoration: none;

				&:hover {
					text-decoration: underline;
				}
			}
		}
	}

	.totals {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
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
