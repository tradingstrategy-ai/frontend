import { error } from '@sveltejs/kit';
import { getCachedTopVaults } from '$lib/top-vaults/cache';
import { calculateTotalTvl, calculateTvlWeightedApy, isBlacklisted, meetsMinTvl } from '$lib/top-vaults/helpers.js';

export async function load({ params, fetch }) {
	const { curator } = params;
	const { vaults, curators } = await getCachedTopVaults(fetch);

	const curatorInfo = curators[curator];
	if (!curatorInfo) error(404, 'Curator not found');

	// aggregate stats for server-rendered SEO metadata; same eligibility rules
	// as the curators index listing
	const eligibleVaults = vaults.filter((v) => v.curator_slug === curator && !isBlacklisted(v) && meetsMinTvl(v));
	const tvl = calculateTotalTvl(eligibleVaults);
	const averageApy = calculateTvlWeightedApy(eligibleVaults);

	return {
		curatorSlug: curator,
		curatorName: curatorInfo.name,
		curator: curatorInfo,
		vaultCount: eligibleVaults.length,
		tvl,
		averageApy
	};
}
