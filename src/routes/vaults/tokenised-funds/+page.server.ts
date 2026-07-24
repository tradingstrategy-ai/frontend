import { getCachedTopVaults } from '$lib/top-vaults/cache';
import { getVaultCurrentTvlUsd } from '$lib/top-vaults/helpers.js';
import { getInlineVaultListing } from '$lib/top-vaults/inline-data';

export async function load({ fetch }) {
	const topVaults = await getCachedTopVaults(fetch);
	const { vaults } = topVaults;
	const tokenisedFunds = vaults.filter((vault) => vault.flags.includes('tokenised_fund'));

	return {
		fundCount: tokenisedFunds.length,
		totalNavUsd: tokenisedFunds.reduce((total, vault) => total + (getVaultCurrentTvlUsd(vault) ?? 0), 0),
		initialTopVaults: getInlineVaultListing(topVaults, tokenisedFunds)
	};
}
