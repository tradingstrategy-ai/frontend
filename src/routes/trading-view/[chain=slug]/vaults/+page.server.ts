import { fetchTopVaults } from '$lib/top-vaults/client';

export async function load({ fetch, params }) {
	const { generated_at: generatedAt, vaults } = await fetchTopVaults(fetch, {
		chainSlug: params.chain
	});

	// TODO: DRY (see trading-view/vaults load fn)
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
