import { getCachedTopVaults } from '$lib/top-vaults/cache';
import { getVaultCurrentTvlUsd, resolveVaultDetails } from '$lib/top-vaults/helpers.js';
import { loadVaultListing } from '$lib/server/top-vaults/listing';
import type { MarketShareChartItem } from '../market-share-pie';

export async function load({ fetch, url }) {
	const topVaults = await getCachedTopVaults(fetch);
	const { vaults, curators } = topVaults;
	const tokenisedFunds = vaults.filter((vault) => vault.flags.includes('tokenised_fund'));
	const fundChartItems: MarketShareChartItem[] = tokenisedFunds.map((vault) => ({
		slug: vault.id,
		label: vault.name,
		name: vault.name,
		tvl: getVaultCurrentTvlUsd(vault) ?? 0,
		avgApy: vault.cagr_net ?? vault.three_months_cagr ?? null,
		logoUrl: vault.curator_slug ? curators[vault.curator_slug]?.logos.generic : undefined,
		href: resolveVaultDetails(vault)
	}));

	return {
		fundCount: tokenisedFunds.length,
		totalNavUsd: tokenisedFunds.reduce((total, vault) => total + (getVaultCurrentTvlUsd(vault) ?? 0), 0),
		fundChartItems,
		...(await loadVaultListing(fetch, url, 'tokenised-funds'))
	};
}
