// Client functions for fetching vault protocol metadata
import { vaultProtocolMetadataUrl } from '$lib/config';
import { createWarmCache } from '$lib/server/warm-cache';
import { isUnknownVaultProtocol } from '$lib/top-vaults/helpers';
import { type VaultProtocolMetadata, vaultProtocolMetadataSchema } from './schemas';

const CLIENT_TIMEOUT = 5000;

/** More than the number of protocols in the export, so normal use never evicts. */
const MAX_CACHED_PROTOCOLS = 300;

/** Load one protocol's metadata; throws on failure so the cache keeps its previous copy. */
async function loadVaultProtocolMetadata(
	fetch: Fetch,
	protocolSlug: string,
	signal?: AbortSignal
): Promise<VaultProtocolMetadata> {
	const url = `${vaultProtocolMetadataUrl}/${protocolSlug}/metadata.json`;
	const timeout = AbortSignal.timeout(CLIENT_TIMEOUT);
	const resp = await fetch(url, { signal: signal ? AbortSignal.any([signal, timeout]) : timeout });
	if (!resp.ok) throw new Error(`Failed to fetch protocol metadata from ${url} (status: ${resp.status})`);
	return vaultProtocolMetadataSchema.parse(await resp.json());
}

/** Protocol metadata keyed by protocol slug, refreshed hourly by the background warmer. */
export const vaultProtocolMetadataCache = createWarmCache<VaultProtocolMetadata>({
	name: 'vault-protocol-metadata',
	load: (protocolSlug, fetch, signal) => loadVaultProtocolMetadata(fetch, protocolSlug, signal),
	refreshIntervalMs: 60 * 60 * 1000,
	maxEntries: MAX_CACHED_PROTOCOLS,
	// the warmer loads every protocol in the export, read or not
	idleTtlMs: Infinity
});

/**
 * Fetch vault protocol metadata from external API (server-side cached)
 *
 * @param fetch SvelteKit's fetch function
 * @param protocolSlug the protocol slug (e.g., 'lagoon-finance')
 * @param protocolName optional protocol display name used to recognise source placeholders
 * @returns parsed metadata or undefined on failure
 */
export async function fetchVaultProtocolMetadata(
	fetch: Fetch,
	protocolSlug: string,
	protocolName?: string | null
): Promise<VaultProtocolMetadata | undefined> {
	if (!vaultProtocolMetadataUrl) {
		console.error('Vault protocol metadata service not configured');
		return undefined;
	}

	if (isUnknownVaultProtocol({ protocol: protocolName, protocol_slug: protocolSlug })) {
		return undefined;
	}

	try {
		return await vaultProtocolMetadataCache.get(fetch, protocolSlug);
	} catch (err) {
		console.error(`Error fetching protocol metadata for ${protocolSlug}:`, err);
		return undefined;
	}
}
