import { getChain } from '$lib/helpers/chain';
import { resolveVaultDetails } from '$lib/top-vaults/helpers.js';
import { fetchVaultProtocolMetadata } from '$lib/vault-protocol/client';
import { error, redirect } from '@sveltejs/kit';

export async function load({ params, parent, fetch }) {
	const { topVaults } = await parent();

	const vault = topVaults.vaults.find((v) => {
		// redirect to canonical vault path if someone tries old vault id URL
		if (v.id === params.vault) {
			redirect(301, resolveVaultDetails(v));
		}

		return v.vault_slug === params.vault;
	});

	if (!vault) error(404, 'Vault not found');

	const chain = getChain(vault.chain_id);
	if (!chain) error(404, 'Chain not found');

	const protocolMetadata = await fetchVaultProtocolMetadata(fetch, vault.protocol_slug);

	return { vault, chain, protocolMetadata };
}
