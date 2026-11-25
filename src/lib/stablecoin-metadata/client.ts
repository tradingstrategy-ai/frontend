// Client functions for fetching stablecoin metadata
import { stablecoinMetadataUrl } from '$lib/config';
import { createWarmCache } from '$lib/server/warm-cache';
import { type StablecoinMetadata, stablecoinMetadataSchema } from './schemas';

// Short timeout — metadata is static JSON on a CDN and best-effort;
// it must not delay SSR when the CDN is slow or unreachable.
const CLIENT_TIMEOUT = 2000;

/**
 * Load the full index. Throws when the service is unreachable or answers with an error, so
 * the cache keeps its previous copy instead of replacing it with an empty list.
 */
async function loadStablecoinMetadataIndex(fetch: Fetch, signal?: AbortSignal): Promise<StablecoinMetadata[]> {
	if (!stablecoinMetadataUrl) {
		console.error('Stablecoin metadata service not configured');
		return [];
	}

	const url = `${stablecoinMetadataUrl}/index.json`;
	const timeout = AbortSignal.timeout(CLIENT_TIMEOUT);
	const resp = await fetch(url, { signal: signal ? AbortSignal.any([signal, timeout]) : timeout });
	if (!resp.ok) throw new Error(`Failed to fetch stablecoin metadata index from ${url} (status: ${resp.status})`);
	return stablecoinMetadataSchema.array().parse(await resp.json());
}

/** The stablecoin metadata index, refreshed every two hours by the background warmer. */
export const stablecoinMetadataCache = createWarmCache<StablecoinMetadata[]>({
	name: 'stablecoin-metadata',
	load: (_key, fetch, signal) => loadStablecoinMetadataIndex(fetch, signal),
	refreshIntervalMs: 2 * 60 * 60 * 1000
});

/**
 * Fetch the full stablecoin metadata index from external API.
 * Results are cached server-side and kept warm in the background.
 *
 * @param fetch SvelteKit's fetch function
 * @returns array of all stablecoin metadata entries, or empty array when it has never loaded
 */
export async function fetchStablecoinMetadataIndex(fetch: Fetch): Promise<StablecoinMetadata[]> {
	try {
		return await stablecoinMetadataCache.get(fetch);
	} catch (err) {
		console.error('Error fetching stablecoin metadata index:', err);
		return [];
	}
}
