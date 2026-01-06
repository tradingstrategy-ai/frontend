// Client functions for fetching vault protocol metadata
import { type VaultProtocolMetadata, vaultProtocolMetadataSchema } from './schemas';

export const METADATA_BASE_URL = 'https://vault-protocol-metadata.tradingstrategy.ai/vault-protocol-metadata';
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
	const url = `${METADATA_BASE_URL}/${protocolSlug}/metadata.json`;

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
