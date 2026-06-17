import { error } from '@sveltejs/kit';
import { getCachedTopVaults } from '$lib/top-vaults/cache';
import { fetchVaultProtocolMetadata } from '$lib/vault-protocol/client';
import { getCore3ProtocolForVault, getProtocolDisplayName } from '$lib/top-vaults/helpers.js';

export async function load({ params, fetch }) {
	const { protocol } = params;
	const { vaults, core3_protocols } = await getCachedTopVaults(fetch);

	const protocolVault = vaults.find((v) => v.protocol_slug === protocol);
	if (!protocolVault) error(404, 'Vault protocol not found');

	const protocolMetadata = await fetchVaultProtocolMetadata(fetch, protocol, protocolVault.protocol);
	const core3 =
		vaults
			.filter((v) => v.protocol_slug === protocol)
			.map((vault) => getCore3ProtocolForVault(vault, core3_protocols))
			.find((rating) => rating !== null) ?? null;

	return {
		protocolSlug: protocol,
		protocolName: getProtocolDisplayName(protocolVault.protocol),
		protocolMetadata,
		core3
	};
}
