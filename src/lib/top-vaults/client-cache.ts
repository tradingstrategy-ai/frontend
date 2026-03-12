/**
 * Client-side in-memory cache for vault data fetched from `/top-vaults/all-data`.
 *
 * Multiple pages under `/trading-view/vaults/` fetch the same data. This module
 * deduplicates those fetches so only the first navigation triggers a network request;
 * subsequent navigations reuse the cached result instantly (no skeleton flash).
 */
import type { TopVaults } from './schemas';

let cached: TopVaults | null = null;
let inflight: Promise<TopVaults> | null = null;

/**
 * Fetch vault data, returning cached data immediately if available.
 * Concurrent callers share the same in-flight request.
 */
export async function fetchAllVaultData(): Promise<TopVaults> {
	if (cached) return cached;
	if (inflight) return inflight;

	inflight = (async () => {
		const resp = await fetch('/top-vaults/all-data');
		if (!resp.ok) throw new Error(`Failed to fetch vault data: ${resp.status}`);
		const data: TopVaults = await resp.json();
		cached = data;
		inflight = null;
		return data;
	})();

	return inflight;
}

/** Whether cached data is already available (no fetch needed). */
export function hasVaultCache(): boolean {
	return cached !== null;
}
