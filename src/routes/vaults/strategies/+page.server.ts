import type { VaultGroup } from '$lib/top-vaults/schemas';
import { getCachedTopVaults } from '$lib/top-vaults/cache';
import { getVaultCategorySlug, isVisibleVaultCategory } from '$lib/top-vaults/categories';
import { getNumberParam, getStringParam } from '$lib/helpers/url-params';
import { sortOptions } from '$lib/top-vaults/VaultGroupTable.svelte';

export async function load({ fetch, url: { searchParams } }) {
	const { categories } = await getCachedTopVaults(fetch);
	const categoryGroups: VaultGroup[] = Object.entries(categories)
		.filter(([tag]) => isVisibleVaultCategory(tag))
		.map(([tag, category]) => ({
			slug: getVaultCategorySlug(tag),
			name: category.label,
			description: category.description,
			vault_count: category.vault_count,
			tvl: category.tvl_usd,
			avg_apy: category.one_month_apy
		}))
		.toSorted((a, b) => a.name.localeCompare(b.name));

	return {
		categories: categoryGroups,
		options: {
			page: getNumberParam(searchParams, 'page', 0),
			sort: searchParams.has('sort') ? getStringParam(searchParams, 'sort', sortOptions.keys, 'name') : null,
			direction: getStringParam(searchParams, 'direction', sortOptions.directions, 'asc')
		}
	};
}
