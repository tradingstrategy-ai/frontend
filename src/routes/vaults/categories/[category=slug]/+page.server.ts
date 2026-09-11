import { error, redirect } from '@sveltejs/kit';
import { getCachedTopVaults } from '$lib/top-vaults/cache';
import { getVaultCategoryTag, isVisibleVaultCategory } from '$lib/top-vaults/categories';

export async function load({ params, fetch, url }) {
	const categoryTag = getVaultCategoryTag(params.category);
	const { categories } = await getCachedTopVaults(fetch);
	if (!isVisibleVaultCategory(categoryTag) || !Object.hasOwn(categories, categoryTag)) {
		error(404, 'Vault category not found');
	}
	redirect(308, `/vaults/strategies/${params.category}${url.search}`);
}
