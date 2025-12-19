import { getNormalizedDenomination } from '$lib/top-vaults/helpers.js';
import { error } from '@sveltejs/kit';

export async function load({ params, parent }) {
	const { denomination } = params;
	const { topVaults } = await parent();

	const vaults = topVaults.vaults.filter((vault) => {
		return getNormalizedDenomination(vault) === denomination;
	});

	if (!vaults.length) error(404, 'Vault stablecoin not found');

	return {
		denomination,
		topVaults: { ...topVaults, vaults }
	};
}
