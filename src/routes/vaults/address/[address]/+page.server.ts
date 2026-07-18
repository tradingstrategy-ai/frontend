import { getCachedTopVaults } from '$lib/top-vaults/cache';
import { resolveVaultDetails } from '$lib/top-vaults/helpers.js';
import { error, redirect } from '@sveltejs/kit';

export async function load({ params, fetch }) {
	const { vaults } = await getCachedTopVaults(fetch);
	const targetAddress = params.address.toLowerCase();

	const vault = vaults.find((v) => v.address.toLowerCase() === targetAddress);

	if (!vault) error(404, 'Vault not found');

	redirect(301, resolveVaultDetails(vault));
}
