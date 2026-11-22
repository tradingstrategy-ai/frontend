/**
 * What the background cache warmer refreshes, and in which order.
 *
 * `scripts/server.js` triggers two jobs through `/_internal/cache/warm`:
 *
 * - `all`, hourly and at start-up: every server-side data cache, inputs before the caches
 *   derived from them, then the `frequent` tasks.
 * - `frequent`, every 20 minutes: the `/strategies` snapshot and the home page blog roll,
 *   which change more often than the hourly vault export.
 *
 * Not warmed: per-vault `metrics` (thousands of vaults; an LRU plus the 1 h edge cache) and
 * responses keyed by arbitrary query strings. Chart caches that live in route modules
 * register themselves when their route is first requested; from then on the `chart-caches`
 * task keeps them fresh, and drops keys nobody has read for a day.
 */
import { vaultProtocolMetadataUrl } from '$lib/config';
import { homePostsCache } from '$lib/blog/home-posts.server';
import { fetchLatestFredValue, fetchLatestTreasuryRate } from '$lib/reference-rates';
import { warmVaultSearchIndex } from '$lib/search/vault-search.server';
import { cryptoVaultsCache } from '$lib/server/top-vaults/crypto-vaults';
import { stablecoinMetadataCache } from '$lib/stablecoin-metadata/client';
import { refreshStrategiesPageData } from '$lib/strategies/page-cache.server';
import { topVaultsCache } from '$lib/top-vaults/cache';
import { isUnknownVaultProtocol } from '$lib/top-vaults/helpers';
import { vaultProtocolMetadataCache } from '$lib/vault-protocol/client';
import type { WarmTask } from './cache-warmer';
import { listWarmCaches, type WarmCache } from './warm-cache';

export type WarmJob = 'all' | 'frequent';

const MINUTE = 60 * 1000;

/** Load a single-value cache if it has never loaded, otherwise refresh it when due. */
function warmSingle(cache: WarmCache<unknown>) {
	return (fetch: Fetch, signal: AbortSignal) =>
		cache.keys().length ? cache.refreshDue(fetch, signal) : cache.refresh(fetch, '', signal);
}

/** Every protocol in the export, so a vault page never waits for its protocol's metadata. */
async function warmProtocolMetadata(fetch: Fetch, signal: AbortSignal) {
	if (!vaultProtocolMetadataUrl) return;
	const { vaults } = await topVaultsCache.get(fetch);
	const known = new Set(vaultProtocolMetadataCache.keys());
	const slugs = new Set(vaults.filter((vault) => !isUnknownVaultProtocol(vault)).map((vault) => vault.protocol_slug));

	const failures: string[] = [];
	for (const slug of slugs) {
		signal.throwIfAborted();
		if (known.has(slug)) continue;
		// a protocol without metadata is normal; it is retried on the next run
		await vaultProtocolMetadataCache.refresh(fetch, slug, signal).catch(() => failures.push(slug));
	}
	await vaultProtocolMetadataCache.refreshDue(fetch, signal).catch(() => {});
	if (failures.length === slugs.size && slugs.size > 0) throw new Error('No protocol metadata could be loaded');
}

/** Names of the caches handled by their own task; every other registered cache is a chart cache. */
const DEDICATED_CACHES = new Set([
	topVaultsCache.name,
	cryptoVaultsCache.name,
	stablecoinMetadataCache.name,
	vaultProtocolMetadataCache.name,
	homePostsCache.name
]);

/** Refresh every route-level chart cache that has been requested since start-up. */
async function warmChartCaches(fetch: Fetch, signal: AbortSignal) {
	const failures: string[] = [];
	for (const cache of listWarmCaches()) {
		if (DEDICATED_CACHES.has(cache.name)) continue;
		signal.throwIfAborted();
		await cache.refreshDue(fetch, signal).catch((error: unknown) => {
			failures.push(`${cache.name}: ${error instanceof Error ? error.message : 'failed'}`);
		});
	}
	if (failures.length) throw new Error(failures.join('; '));
}

const frequentTasks: WarmTask[] = [
	{ name: 'home-blog-posts', timeoutMs: MINUTE, run: warmSingle(homePostsCache) },
	{ name: 'strategies-page', timeoutMs: 15 * MINUTE, run: (fetch) => refreshStrategiesPageData(fetch) }
];

const allTasks: WarmTask[] = [
	{
		name: 'reference-rates',
		timeoutMs: MINUTE,
		run: () => Promise.all([fetchLatestFredValue('SNDR'), fetchLatestTreasuryRate()])
	},
	{ name: 'top-vaults', timeoutMs: 3 * MINUTE, run: warmSingle(topVaultsCache) },
	{ name: 'crypto-vaults', timeoutMs: 2 * MINUTE, run: warmSingle(cryptoVaultsCache) },
	{ name: 'stablecoin-metadata', timeoutMs: MINUTE, run: warmSingle(stablecoinMetadataCache) },
	{ name: 'vault-protocol-metadata', timeoutMs: 5 * MINUTE, run: warmProtocolMetadata },
	{ name: 'search-index', timeoutMs: MINUTE, run: (fetch) => warmVaultSearchIndex(fetch) },
	{ name: 'chart-caches', timeoutMs: 15 * MINUTE, run: warmChartCaches },
	...frequentTasks
];

/**
 * Tasks for a job, in run order.
 *
 * @param job `all` (hourly) or `frequent` (every 20 minutes)
 */
export function getWarmTasks(job: WarmJob): WarmTask[] {
	return job === 'all' ? allTasks : frequentTasks;
}
