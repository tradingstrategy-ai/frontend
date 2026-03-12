import { error } from '@sveltejs/kit';
import { getCachedTopVaults } from '$lib/top-vaults/cache';

export async function load({ params, fetch }) {
	const { denomination } = params;
	const { vaults } = await getCachedTopVaults(fetch);

	const match = vaults.find((v) => v.denomination_slug === denomination);
	if (!match) error(404, 'Vault stablecoin not found');

	return {
		denominationSlug: denomination,
		denominationName: match.normalised_denomination
	};
}
