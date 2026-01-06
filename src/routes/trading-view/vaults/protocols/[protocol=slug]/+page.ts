import { error } from '@sveltejs/kit';
import { fetchVaultProtocolMetadata } from '$lib/vault-protocol/client';

export async function load({ params, parent, fetch }) {
	const { protocol } = params;
	const { topVaults } = await parent();

	const vaults = topVaults.vaults.filter((vault) => {
		return vault.protocol_slug === protocol;
	});

	if (!vaults.length) error(404, 'Vault protocol not found');

	const protocolMetadata = await fetchVaultProtocolMetadata(fetch, protocol);

	return {
		protocolSlug: protocol,
		protocolName: vaults[0].protocol,
		topVaults: { ...topVaults, vaults },
		protocolMetadata
	};
}
