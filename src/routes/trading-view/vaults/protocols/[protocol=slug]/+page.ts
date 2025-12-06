import { error } from '@sveltejs/kit';
import { slugify } from '$lib/helpers/slugify.js';

export async function load({ params, parent }) {
	const { protocol } = params;
	const { topVaults } = await parent();

	const vaults = topVaults.vaults.filter((vault) => {
		return slugify(vault.protocol) === protocol;
	});

	if (!vaults.length) error(404, 'Vault protocol not found');

	return {
		protocolSlug: protocol,
		protocolName: vaults[0].protocol,
		topVaults: { ...topVaults, vaults }
	};
}
