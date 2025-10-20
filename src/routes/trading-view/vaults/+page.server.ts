import { fetchTopVaults } from '$lib/top-vaults/client';

export async function load({ fetch }) {
	const vaultData = await fetchTopVaults(fetch);

	const { generated_at: generatedAt, vaults } = vaultData;

	// TODO: DRY (see trading-view/[chain=slug]/vaults load fn)
	const totals = vaults.reduce(
		(acc, vault) => {
			acc.current += vault.current_tvl_usd ?? 0;
			acc.peak += vault.peak_tvl_usd ?? 0;
			return acc;
		},
		{ current: 0, peak: 0 }
	);

	return {
		generatedAt,
		vaults,
		totalTvlUsd: totals.current,
		totalPeakTvlUsd: totals.peak
	};
}
