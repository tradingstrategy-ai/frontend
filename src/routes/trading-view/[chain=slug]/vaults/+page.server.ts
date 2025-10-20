import { getChain } from '$lib/helpers/chain';
import { fetchTopVaults } from '$lib/top-vaults/client';

export async function load({ fetch, params }) {
	const chainId = getChain(params.chain)!.id;

	const vaultData = await fetchTopVaults(fetch);

	const { generated_at: generatedAt, vaults = [] } = vaultData;

	// TODO: move to client
	vaults.sort((a, b) => b['1m_return'] - a['1m_return']);

	// TODO: move to client
	const chainVaults = vaults.filter((vault) => vault.chain === chainId);

	// TODO: DRY (see trading-view/vaults load fn)
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
		vaults: chainVaults,
		totalTvlUsd: totals.current,
		totalPeakTvlUsd: totals.peak
	};
}
