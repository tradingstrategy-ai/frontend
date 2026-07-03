/**
 * Client-side in-memory cache for vault data fetched from `/top-vaults/all-data`.
 *
 * Multiple pages under `/trading-view/vaults/` fetch the same data. This module
 * deduplicates those fetches so only the first navigation triggers a network request;
 * subsequent navigations reuse the cached result instantly (no skeleton flash).
 */
import type { TopVaults } from './schemas';

let cached: TopVaults | null = null;
let inflight: { expectedGeneratedAt: string | Date | null; promise: Promise<TopVaults> } | null = null;

// The incident this protects against was a transient listing/detail mismatch:
// the listing showed a 1M annualised return above 100% for the Peter Schiff
// vault, while the detail page showed about -23%. Current production data later
// converged to -23.3% in both places, which points to stale client or endpoint
// cache data rather than a formatter-specific bug.
function timestamp(generatedAt: string | Date | null | undefined): number | null {
	if (!generatedAt) return null;

	const value = new Date(generatedAt).getTime();
	return Number.isFinite(value) ? value : null;
}

function isOlderThan(
	generatedAt: string | Date | null | undefined,
	expectedGeneratedAt: string | Date | null
): boolean {
	const expected = timestamp(expectedGeneratedAt);
	if (expected === null) return false;

	const actual = timestamp(generatedAt);
	return actual === null || actual < expected;
}

async function requestAllVaultData(cacheBust = false): Promise<TopVaults> {
	// cache: 'reload' is only used after we have proof that a normal fetch returned
	// a payload older than the layout's generatedAt. That keeps normal navigation
	// fast while giving us a recovery path from stale HTTP cache entries.
	const resp = await fetch('/top-vaults/all-data', cacheBust ? { cache: 'reload' } : undefined);
	if (!resp.ok) throw new Error(`Failed to fetch vault data: ${resp.status}`);
	return resp.json();
}

/**
 * Fetch vault data, returning cached data immediately if available.
 * Concurrent callers share the same in-flight request.
 */
export async function fetchAllVaultData(expectedGeneratedAt?: string | Date | null): Promise<TopVaults> {
	const expected = expectedGeneratedAt ?? null;
	// Reuse the in-memory payload only if it is at least as fresh as the route
	// layout data. Without this check, a user could navigate from a stale listing
	// to a freshly rendered detail page and see conflicting return metrics for the
	// same vault until the tab was reloaded.
	if (cached && !isOlderThan(cached.generated_at, expected)) return cached;
	// Share an in-flight request only when it targets a version fresh enough for
	// this caller. If a newer layout generatedAt arrives while an older request is
	// running, start a newer request instead of waiting for known-stale data.
	if (inflight && !isOlderThan(inflight.expectedGeneratedAt, expected)) return inflight.promise;

	const promise = (async () => {
		let data = await requestAllVaultData();

		// A stale browser/intermediary cache can still return an older export.
		// Detect that condition from the payload itself and retry once with an
		// explicit cache reload.
		if (isOlderThan(data.generated_at, expected)) {
			console.warn(
				`Vault data response ${data.generated_at} is older than expected ${expected}; retrying without HTTP cache.`
			);
			data = await requestAllVaultData(true);
		}

		// If this warning fires, the server-side cache or upstream export is still
		// behind the route layout data. We keep the response so the UI can render,
		// but the warning gives enough version context to debug a future mismatch.
		if (isOlderThan(data.generated_at, expected)) {
			console.warn(`Vault data response ${data.generated_at} is still older than expected ${expected}.`);
		}

		// If an older request completes after a newer request, do not let it
		// regress the process-wide in-memory cache back to stale listing data.
		// Return the fresher cached payload to the original caller as well; route
		// components apply resolved payloads directly, so returning older data here
		// could briefly repaint a listing with stale return metrics.
		if (cached && isOlderThan(data.generated_at, cached.generated_at)) {
			return cached;
		}

		cached = data;
		return data;
	})().finally(() => {
		if (inflight?.promise === promise) inflight = null;
	});

	inflight = { expectedGeneratedAt: expected, promise };
	return promise;
}

/** Whether cached data is already available (no fetch needed). */
export function hasVaultCache(expectedGeneratedAt?: string | Date | null): boolean {
	const expected = expectedGeneratedAt ?? null;
	// Loading skeletons should appear when the only cached payload is older than
	// the layout's expected version, because that old payload could contain the
	// exact stale listing values that caused the Peter Schiff mismatch.
	return cached !== null && !isOlderThan(cached.generated_at, expected);
}
