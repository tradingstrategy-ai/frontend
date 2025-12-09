import { resolveVaultDetails } from '$lib/top-vaults/helpers.js';
import { error, redirect } from '@sveltejs/kit';

export async function load({ params, parent }) {
	const { topVaults } = await parent();

	const vault = topVaults.vaults.find((v) => {
		// redirect to canonical vault path if someone tries old vault id URL
		if (v.id === params.vault) {
			redirect(301, resolveVaultDetails(v));
		}

		return v.vault_slug === params.vault;
	});

	if (!vault) error(404, 'Vault not found');

	return { vault };
}
