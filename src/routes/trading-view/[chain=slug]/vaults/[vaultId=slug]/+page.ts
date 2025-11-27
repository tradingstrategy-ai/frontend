import { error } from '@sveltejs/kit';

export async function load({ params, parent }) {
	const { vaultId } = params;
	const { topVaults } = await parent();

	const vault = topVaults.vaults.find(({ id }) => id === vaultId);
	if (!vault) error(404, 'Vault not found');

	return { vault };
}
