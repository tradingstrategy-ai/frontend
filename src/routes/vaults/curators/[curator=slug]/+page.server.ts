import { error } from '@sveltejs/kit';
import { getCachedTopVaults } from '$lib/top-vaults/cache';
import { getInlineVaultListing } from '$lib/top-vaults/inline-data';
import {
	calculateTotalTvl,
	calculateTvlWeightedApy,
	isBlacklisted,
	meetsMinTvl,
	withVaultCurrentTvlUsd
} from '$lib/top-vaults/helpers.js';

export async function load({ params, fetch }) {
	const { curator } = params;
	const topVaults = await getCachedTopVaults(fetch);
	const { vaults, curators } = topVaults;

	const curatorInfo = curators[curator];
	if (!curatorInfo) error(404, 'Curator not found');

	// aggregate stats for server-rendered SEO metadata; same eligibility rules
	// as the curators index listing
	const eligibleVaults = vaults.filter((v) => v.curator_slug === curator && !isBlacklisted(v) && meetsMinTvl(v));
	const eligibleVaultsWithUsdTvl = eligibleVaults.map(withVaultCurrentTvlUsd);
	const tvl = calculateTotalTvl(eligibleVaultsWithUsdTvl);
	const averageApy = calculateTvlWeightedApy(eligibleVaultsWithUsdTvl);

	return {
		curatorSlug: curator,
		curatorName: curatorInfo.name,
		curator: curatorInfo,
		vaultCount: eligibleVaults.length,
		tvl,
		averageApy,
		totalVaultCount: vaults.length,
		initialTopVaults: getInlineVaultListing(
			topVaults,
			vaults.filter((vault) => vault.curator_slug === curator)
		)
	};
}
