// src/lib/top-vaults/server-config.ts

/**
 * Private vault data accessors — server-only.
 *
 * Reads vault data from R2 (preferred) or falls back to a direct private URL.
 * SvelteKit blocks client-side imports via `$env/dynamic/private`.
 */
import { env } from '$env/dynamic/private';
import { getR2Object, headR2Object, isR2Configured } from '$lib/r2/client';
import { VAULT_PRICES_PARQUET } from './constants';

/** R2 object key for the top vaults JSON. */
const TOP_VAULTS_KEY = 'top_vaults_by_chain.json';

/** Fallback private URL for top vaults JSON (when R2 is not configured). */
const topVaultsPrivateUrl: string | undefined = env.TS_PRIVATE_TOP_VAULTS_URL;

function logTopVaultsAccessIssue(message: string) {
	console.warn(message);
}

/**
 * Fetch the top vaults JSON content.
 *
 * Tries R2 first; falls back to `TS_PRIVATE_TOP_VAULTS_URL` if R2 is not configured.
 *
 * @param fetch SvelteKit's fetch function (used for URL fallback)
 * @returns Parsed JSON object
 * @throws When neither R2 nor fallback URL is configured, or when the fetch fails
 */
export async function fetchTopVaultsRaw(fetch: Fetch): Promise<unknown> {
	if (isR2Configured()) {
		try {
			const result = await getR2Object(TOP_VAULTS_KEY);
			if (result?.body) {
				const text = await result.body.transformToString();
				return JSON.parse(text);
			}
		} catch {
			logTopVaultsAccessIssue('R2 fetch failed for top vaults, falling back to the configured private source');
		}
	}

	if (!topVaultsPrivateUrl) {
		throw new Error('Neither R2 nor TS_PRIVATE_TOP_VAULTS_URL is configured');
	}

	const resp = await fetch(topVaultsPrivateUrl);
	if (!resp.ok) {
		throw new Error(`Fetching top vaults from the configured private source failed with status ${resp.status}`);
	}
	return resp.json();
}

/**
 * Get metadata (size, last-modified) for the top vaults JSON.
 *
 * @param fetch SvelteKit's fetch (used for HEAD fallback)
 */
export async function headTopVaults(fetch: Fetch) {
	if (isR2Configured()) {
		const meta = await headR2Object(TOP_VAULTS_KEY);
		return {
			size: meta?.contentLength ?? null,
			lastModified: meta?.lastModified ?? null
		};
	}

	if (!topVaultsPrivateUrl) return { size: null, lastModified: null };

	const resp = await fetch(topVaultsPrivateUrl, { method: 'HEAD' });
	if (!resp.ok) return { size: null, lastModified: null };

	const contentLength = resp.headers.get('content-length');
	const size = contentLength ? Number.parseInt(contentLength, 10) : null;
	const lastModifiedStr = resp.headers.get('last-modified');
	const lastModified = lastModifiedStr ? new Date(lastModifiedStr) : null;

	return {
		size: Number.isFinite(size) ? size : null,
		lastModified: lastModified && !Number.isNaN(lastModified.valueOf()) ? lastModified : null
	};
}

/**
 * Get metadata (size, last-modified) for the vault prices parquet file.
 *
 * @param fetch SvelteKit's fetch (used for HEAD fallback)
 */
export async function headVaultPrices(fetch: Fetch) {
	if (isR2Configured()) {
		const meta = await headR2Object(VAULT_PRICES_PARQUET);
		return {
			size: meta?.contentLength ?? null,
			lastModified: meta?.lastModified ?? null
		};
	}

	// No fallback — parquet file is only available via private R2
	return { size: null, lastModified: null };
}
