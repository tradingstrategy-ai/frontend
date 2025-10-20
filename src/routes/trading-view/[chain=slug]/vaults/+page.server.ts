import { getChain } from '$lib/helpers/chain';
import { fetchTopVaults } from '$lib/top-vaults/client';

type RemoteVault = {
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
	chain: number;
};

export async function load({ fetch, params }) {
	const chainRecord = getChain(params.chain)!;

	const vaultData = await fetchTopVaults(fetch);

	const { generated_at: generatedAt, vaults = [] } = vaultData as {
		generated_at: string;
		vaults: RemoteVault[];
	};

	vaults.sort((a, b) => (b['1m_return_ann'] ?? 0) - (a['1m_return_ann'] ?? 0));

	const chainVaults = vaults
		.filter((vault) => vault.chain === chainRecord.id)
		.sort((a, b) => (b['1m_return_ann'] ?? 0) - (a['1m_return_ann'] ?? 0));

	const totals = chainVaults.reduce(
		(acc, vault) => {
			acc.current += vault.current_tvl_usd ?? 0;
			acc.peak += vault.peak_tvl_usd ?? 0;
			return acc;
		},
		{ current: 0, peak: 0 }
	);

	return {
		generatedAt,
		chain: chainRecord,
		vaults: chainVaults,
		totalTvlUsd: totals.current,
		totalPeakTvlUsd: totals.peak
	};
}
