import { resolve } from '$app/paths';
import { error, redirect } from '@sveltejs/kit';

export async function load({ params, parent }) {
	const { topVaults } = await parent();

	const vault = topVaults.vaults.find(({ id, vault_slug }) => {
		// redirect to vault_slug if someone tries old vault id URL
		if (id === params.vault) {
			redirect(301, resolve(`/trading-view/${params.chain}/vaults/${vault_slug}`));
		}

		return vault_slug === params.vault;
	});

	if (!vault) error(404, 'Vault not found');

	return { vault };
}
