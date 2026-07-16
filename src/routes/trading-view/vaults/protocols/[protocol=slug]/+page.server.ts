import { error } from '@sveltejs/kit';
import { getCachedTopVaults } from '$lib/top-vaults/cache';
import { fetchVaultProtocolMetadata } from '$lib/vault-protocol/client';
import {
	getCore3ProtocolForVault,
	getProtocolDisplayName,
	isUnknownVaultProtocol,
	UNKNOWN_VAULT_PROTOCOL_DISPLAY_NAME,
	UNKNOWN_VAULT_PROTOCOL_SLUG
} from '$lib/top-vaults/helpers.js';

export async function load({ params, fetch }) {
	const { protocol } = params;
	const { vaults, core3_protocols } = await getCachedTopVaults(fetch);

	const isUnknownGroup = protocol === UNKNOWN_VAULT_PROTOCOL_SLUG;
	const protocolVault = vaults.find((v) => (isUnknownGroup ? isUnknownVaultProtocol(v) : v.protocol_slug === protocol));
	if (!protocolVault) error(404, 'Vault protocol not found');

	const protocolMetadata = isUnknownGroup
		? undefined
		: await fetchVaultProtocolMetadata(fetch, protocol, protocolVault.protocol);
	const core3 =
		vaults
			.filter((v) => (isUnknownGroup ? isUnknownVaultProtocol(v) : v.protocol_slug === protocol))
			.map((vault) => getCore3ProtocolForVault(vault, core3_protocols))
			.find((rating) => rating !== null) ?? null;

	return {
		protocolSlug: protocol,
		protocolName: isUnknownGroup
			? UNKNOWN_VAULT_PROTOCOL_DISPLAY_NAME
			: getProtocolDisplayName(protocolVault.protocol, protocolVault.protocol_slug),
		protocolMetadata,
		core3
	};
}
