// Client functions for fetching vault protocol metadata
import { vaultProtocolMetadataUrl } from '$lib/config';
import { type VaultProtocolMetadata, vaultProtocolMetadataSchema } from './schemas';

const CLIENT_TIMEOUT = 5000;

/**
 * Fetch vault protocol metadata from external API
 *
 * @param fetch SvelteKit's fetch function
 * @param protocolSlug the protocol slug (e.g., 'lagoon-finance')
 * @returns parsed metadata or undefined on failure
 */
export async function fetchVaultProtocolMetadata(
	fetch: Fetch,
	protocolSlug: string
): Promise<VaultProtocolMetadata | undefined> {
	if (!vaultProtocolMetadataUrl) {
		console.error('Vault protocol metadata service not configured');
		return undefined;
	}

	const url = `${vaultProtocolMetadataUrl}/${protocolSlug}/metadata.json`;

	try {
		const resp = await fetch(url, { signal: AbortSignal.timeout(CLIENT_TIMEOUT) });
		if (!resp.ok) {
			console.error(`Failed to fetch protocol metadata from ${url} (status: ${resp.status})`);
			return undefined;
		}
		return vaultProtocolMetadataSchema.parse(await resp.json());
	} catch (err) {
		console.error(`Error fetching protocol metadata for ${protocolSlug}:`, err);
		return undefined;
	}
}
