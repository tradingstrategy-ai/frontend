// Client functions for fetching stablecoin metadata
import { stablecoinMetadataUrl } from '$lib/config';
import { type StablecoinMetadata, stablecoinMetadataSchema } from './schemas';

// Short timeout — metadata is static JSON on a CDN and best-effort;
// it must not delay SSR when the CDN is slow or unreachable.
const CLIENT_TIMEOUT = 2000;
const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

let indexCache: { data: StablecoinMetadata[]; expires: number } | null = null;
const slugCache = new Map<string, { data: StablecoinMetadata; expires: number }>();

/**
 * Fetch stablecoin metadata from external API.
 * Results are cached server-side per slug with a 2-hour TTL.
 *
 * @param fetch SvelteKit's fetch function
 * @param slug the stablecoin slug (e.g., 'usdc')
 * @returns parsed metadata or undefined on failure
 */
export async function fetchStablecoinMetadata(fetch: Fetch, slug: string): Promise<StablecoinMetadata | undefined> {
	const now = Date.now();
	const cached = slugCache.get(slug);
	if (cached && now < cached.expires) return cached.data;

	if (!stablecoinMetadataUrl) {
		console.error('Stablecoin metadata service not configured');
		return undefined;
	}

	const url = `${stablecoinMetadataUrl}/${slug}/metadata.json`;

	try {
		const resp = await fetch(url, { signal: AbortSignal.timeout(CLIENT_TIMEOUT) });
		if (!resp.ok) {
			console.error(`Failed to fetch stablecoin metadata from ${url} (status: ${resp.status})`);
			return undefined;
		}
		const data = await resp.json();
		// API returns an array with a single element
		const items = stablecoinMetadataSchema.array().parse(data);
		const result = items[0];
		if (result) {
			slugCache.set(slug, { data: result, expires: now + CACHE_TTL_MS });
		}
		return result;
	} catch (err) {
		console.error(`Error fetching stablecoin metadata for ${slug}:`, err);
		return undefined;
	}
}

/**
 * Fetch the full stablecoin metadata index from external API.
 * Results are cached server-side with a 2-hour TTL.
 *
 * @param fetch SvelteKit's fetch function
 * @returns array of all stablecoin metadata entries, or empty array on failure
 */
export async function fetchStablecoinMetadataIndex(fetch: Fetch): Promise<StablecoinMetadata[]> {
	const now = Date.now();
	if (indexCache && now < indexCache.expires) return indexCache.data;

	if (!stablecoinMetadataUrl) {
		console.error('Stablecoin metadata service not configured');
		return [];
	}

	const url = `${stablecoinMetadataUrl}/index.json`;

	try {
		const resp = await fetch(url, { signal: AbortSignal.timeout(CLIENT_TIMEOUT) });
		if (!resp.ok) {
			console.error(`Failed to fetch stablecoin metadata index from ${url} (status: ${resp.status})`);
			return [];
		}
		const data = stablecoinMetadataSchema.array().parse(await resp.json());
		indexCache = { data, expires: now + CACHE_TTL_MS };
		return data;
	} catch (err) {
		console.error('Error fetching stablecoin metadata index:', err);
		return [];
	}
}
