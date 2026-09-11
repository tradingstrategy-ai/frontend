import { error, redirect } from '@sveltejs/kit';
import { getCachedTopVaults } from '$lib/top-vaults/cache';
import { getVaultCategorySlug, getVaultCategoryTag, isVisibleVaultCategory } from '$lib/top-vaults/categories';
import { loadVaultListing } from '$lib/server/top-vaults/listing';
import { isEligibleVaultGroupMiniChartVault } from '$lib/echarts/vault-group-mini-chart-server';

export async function load({ params, fetch, url }) {
	const categoryTag = getVaultCategoryTag(params.category);
	if (!isVisibleVaultCategory(categoryTag)) error(404, 'Vault category not found');

	const topVaults = await getCachedTopVaults(fetch);
	const category = Object.hasOwn(topVaults.categories, categoryTag) ? topVaults.categories[categoryTag] : undefined;
	if (!category) error(404, 'Vault category not found');
	const canonicalSlug = getVaultCategorySlug(categoryTag);
	if (params.category !== canonicalSlug) redirect(301, `/vaults/strategies/${canonicalSlug}${url.search}`);
	const categoryVaults = topVaults.vaults.filter((vault) => (vault.strategy_tags ?? []).includes(categoryTag));

	return {
		category,
		categorySlug: canonicalSlug,
		hasChartData: categoryVaults.some(isEligibleVaultGroupMiniChartVault),
		...(await loadVaultListing(fetch, url, 'category', categoryTag))
	};
}
