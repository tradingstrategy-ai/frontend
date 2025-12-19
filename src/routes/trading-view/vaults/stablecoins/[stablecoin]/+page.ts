import { getDenominationSlug } from '$lib/top-vaults/helpers.js';
import { error } from '@sveltejs/kit';

export async function load({ params, parent }) {
	const { stablecoin } = params;
	const { topVaults } = await parent();

	const vaults = topVaults.vaults.filter((vault) => {
		return getDenominationSlug(vault) === stablecoin;
	});

	if (!vaults.length) error(404, 'Vault stablecoin not found');

	return {
		stablecoinSlug: stablecoin,
		stablecoinName: vaults[0].denomination,
		topVaults: { ...topVaults, vaults }
	};
}
