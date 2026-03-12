import { error } from '@sveltejs/kit';
import { getCachedTopVaults } from '$lib/top-vaults/cache';
import { fetchVaultProtocolMetadata } from '$lib/vault-protocol/client';

export async function load({ params, fetch }) {
	const { protocol } = params;
	const { vaults } = await getCachedTopVaults(fetch);

	const protocolVault = vaults.find((v) => v.protocol_slug === protocol);
	if (!protocolVault) error(404, 'Vault protocol not found');

	const protocolMetadata = await fetchVaultProtocolMetadata(fetch, protocol);

	return {
		protocolSlug: protocol,
		protocolName: protocolVault.protocol,
		protocolMetadata
	};
}
