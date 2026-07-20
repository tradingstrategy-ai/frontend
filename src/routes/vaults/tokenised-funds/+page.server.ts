import { getCachedTopVaults } from '$lib/top-vaults/cache';
import { getVaultCurrentTvlUsd } from '$lib/top-vaults/helpers.js';

export async function load({ fetch }) {
	const { vaults } = await getCachedTopVaults(fetch);
	const tokenisedFunds = vaults.filter((vault) => vault.flags.includes('tokenised_fund'));

	return {
		fundCount: tokenisedFunds.length,
		totalNavUsd: tokenisedFunds.reduce((total, vault) => total + (getVaultCurrentTvlUsd(vault) ?? 0), 0)
	};
}
