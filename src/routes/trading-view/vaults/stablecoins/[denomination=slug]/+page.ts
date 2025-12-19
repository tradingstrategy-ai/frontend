import { error } from '@sveltejs/kit';

export async function load({ params, parent }) {
	const { denomination } = params;
	const { topVaults } = await parent();

	const vaults = topVaults.vaults.filter((vault) => {
		return vault.denomination_slug === denomination;
	});

	if (!vaults.length) error(404, 'Vault stablecoin not found');

	return {
		denominationSlug: denomination,
		denominationName: vaults[0].normalised_denomination,
		topVaults: { ...topVaults, vaults }
	};
}
