/**
 * Persistent, server-only cache for the complete strategies listing payload.
 *
 * The cache deliberately stores separately prepared public and admin variants:
 * a request's cookies or role must never influence the shared snapshot.
 */
import { mkdir, open, readdir, readFile, rename, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { env } from '$env/dynamic/private';
import { parse, stringify } from 'devalue';
import type { StrategyInfo } from 'trade-executor/models/strategy-info';
import type { PerformanceData } from 'trade-executor/schemas/utility-types.js';
import { fetchPublicApi } from '$lib/helpers/public-api';
import { yamlStrategies } from '$lib/strategies/yaml/loader';
import { compareStrategiesForFrontend } from '$lib/strategies/sort';
import { toListingStrategy } from '$lib/strategies/yaml/adapter';
import { fetchSharePriceReturns90d } from '$lib/strategies/yaml/share-price';
import { fetchTopVaults } from '$lib/top-vaults/client';
import { getAllStrategies } from 'trade-executor/client/strategy-info';
import { compactStrategyTileChartData, getStrategyChartDateRange } from 'trade-executor/helpers/chart';

export const STRATEGIES_PAGE_CACHE_TTL_MS = 30 * 60 * 1000;
const CACHE_VERSION = 1;
const CACHE_FILE_NAME = 'strategies-page.devalue';

type StrategiesVariant = {
	strategies: StrategyInfo[];
	tvlData?: PerformanceData;
};

type StrategiesPageCacheSnapshot = {
	version: number;
	updatedAt: Date;
	public: StrategiesVariant;
	admin: StrategiesVariant;
};

let cacheDirectory = env.TS_PRIVATE_STRATEGIES_CACHE_DIR ?? join(process.cwd(), '.cache', 'strategies');
let snapshot: StrategiesPageCacheSnapshot | undefined;
let initialisePromise: Promise<void> | undefined;
let persistentCacheAvailable = true;
let refreshPromise: Promise<StrategiesPageCacheSnapshot> | undefined;
let cacheSource: 'empty' | 'memory' | 'filesystem' | 'upstream' = 'empty';
let lastRefreshAt: Date | undefined;
let lastRefreshError: string | undefined;

function cacheFilePath() {
	return join(cacheDirectory, CACHE_FILE_NAME);
}

function safeError(error: unknown) {
	const message = error instanceof Error ? `${error.name}: ${error.message}` : 'Unknown cache refresh error';
	return message.slice(0, 300);
}

function isStrategyList(value: unknown): value is StrategyInfo[] {
	return (
		Array.isArray(value) &&
		value.every(
			(strategy) =>
				Boolean(strategy) && typeof strategy === 'object' && typeof (strategy as { id?: unknown }).id === 'string'
		)
	);
}

function isSnapshot(value: unknown): value is StrategiesPageCacheSnapshot {
	if (!value || typeof value !== 'object') return false;
	const candidate = value as Partial<StrategiesPageCacheSnapshot>;
	const publicVariant = candidate.public;
	const adminVariant = candidate.admin;
	if (!publicVariant || !adminVariant) return false;

	return (
		candidate.version === CACHE_VERSION &&
		candidate.updatedAt instanceof Date &&
		!Number.isNaN(candidate.updatedAt.valueOf()) &&
		isStrategyList(publicVariant.strategies) &&
		isStrategyList(adminVariant.strategies)
	);
}

function initialiseCache() {
	if (initialisePromise) return initialisePromise;

	initialisePromise = (async () => {
		try {
			await mkdir(cacheDirectory, { recursive: true });
			const files = await readdir(cacheDirectory);
			await Promise.all(
				files
					.filter((file) => file.startsWith(`${CACHE_FILE_NAME}.tmp-`))
					.map((file) => unlink(join(cacheDirectory, file)).catch(() => undefined))
			);
		} catch (error) {
			persistentCacheAvailable = false;
			console.warn(`[strategies-cache] Persistent cache unavailable; using memory only (${safeError(error)}).`);
			return;
		}

		try {
			const decoded = parse(await readFile(cacheFilePath(), 'utf8'));
			if (!isSnapshot(decoded)) {
				console.warn('[strategies-cache] Ignoring an invalid or incompatible cache snapshot.');
				return;
			}
			snapshot = decoded;
			cacheSource = 'filesystem';
			lastRefreshAt = decoded.updatedAt;
		} catch (error) {
			const code = (error as NodeJS.ErrnoException).code;
			if (code !== 'ENOENT') console.warn(`[strategies-cache] Could not read cache snapshot (${safeError(error)}).`);
		}
	})();

	return initialisePromise;
}

async function writeSnapshot(nextSnapshot: StrategiesPageCacheSnapshot) {
	if (!persistentCacheAvailable) return;
	const destination = cacheFilePath();
	const temporary = `${destination}.tmp-${process.pid}-${crypto.randomUUID()}`;
	let file: Awaited<ReturnType<typeof open>> | undefined;

	try {
		file = await open(temporary, 'w', 0o600);
		await file.writeFile(stringify(nextSnapshot), 'utf8');
		await file.sync();
		await file.close();
		file = undefined;
		await rename(temporary, destination);
	} catch (error) {
		await file?.close().catch(() => undefined);
		await unlink(temporary).catch(() => undefined);
		console.warn(`[strategies-cache] Could not persist snapshot; retrying on the next refresh (${safeError(error)}).`);
	}
}

/**
 * Preserve SvelteKit's request-aware relative URL handling while preventing a
 * visitor's credentials, location headers, or role from entering the snapshot.
 */
function createCredentialNeutralFetch(fetch: Fetch): Fetch {
	return (async (input: RequestInfo | URL, init?: RequestInit) => {
		const requestHeaders = input instanceof Request ? input.headers : undefined;
		const headers = new Headers(requestHeaders);
		new Headers(init?.headers).forEach((value, key) => headers.set(key, value));
		for (const header of [
			'authorization',
			'cookie',
			'cf-ipcountry',
			'x-forwarded-for',
			'x-forwarded-host',
			'x-forwarded-proto',
			'x-real-ip'
		]) {
			headers.delete(header);
		}

		return fetch(input as RequestInfo, { ...init, credentials: 'omit', headers });
	}) as Fetch;
}

async function fetchTvlData(fetch: Fetch) {
	try {
		const data = await fetchPublicApi<{ strategies_tvl?: PerformanceData }>(fetch, 'impressive-numbers');
		return data.strategies_tvl;
	} catch (error) {
		console.warn(`[strategies-cache] Rendering admin data without TVL (${safeError(error)}).`);
		return undefined;
	}
}

async function getYamlStrategies(fetch: Fetch): Promise<StrategyInfo[]> {
	const configs = [...yamlStrategies.values()];
	if (!configs.length) return [];

	const topVaults = await fetchTopVaults(fetch);
	return Promise.all(
		configs.map(async (config) => {
			const vault = topVaults.vaults.find((candidate) => candidate.address === config.vault_address);
			const returns = vault ? await fetchSharePriceReturns90d(fetch, vault.id) : undefined;
			return toListingStrategy(config, vault, returns);
		})
	);
}

function prepareStrategies(strategies: StrategyInfo[]) {
	const sorted = [...strategies].sort(compareStrategiesForFrontend);
	const [startAt] = getStrategyChartDateRange(sorted);
	return sorted.map((strategy) => compactStrategyTileChartData(strategy, startAt));
}

async function buildSnapshot(fetch: Fetch): Promise<StrategiesPageCacheSnapshot> {
	const neutralFetch = createCredentialNeutralFetch(fetch);
	const [apiStrategies, yamlStrategiesList, tvlData] = await Promise.all([
		getAllStrategies(neutralFetch),
		getYamlStrategies(neutralFetch),
		fetchTvlData(neutralFetch)
	]);
	const liveOnly = (strategy: StrategyInfo) => strategy.tags?.includes('live');

	return {
		version: CACHE_VERSION,
		updatedAt: new Date(),
		public: {
			strategies: prepareStrategies([...apiStrategies.filter(liveOnly), ...yamlStrategiesList.filter(liveOnly)])
		},
		admin: { strategies: prepareStrategies([...apiStrategies, ...yamlStrategiesList]), tvlData }
	};
}

/** Force an upstream refresh while retaining the last known-good snapshot on failure. */
export async function refreshStrategiesPageData(fetch: Fetch): Promise<StrategiesPageCacheSnapshot> {
	await initialiseCache();
	if (refreshPromise) return refreshPromise;

	refreshPromise = (async () => {
		try {
			const nextSnapshot = await buildSnapshot(fetch);
			await writeSnapshot(nextSnapshot);
			snapshot = nextSnapshot;
			cacheSource = 'upstream';
			lastRefreshAt = nextSnapshot.updatedAt;
			lastRefreshError = undefined;
			return nextSnapshot;
		} catch (error) {
			lastRefreshError = safeError(error);
			console.error(`[strategies-cache] Refresh failed; keeping the last good snapshot (${lastRefreshError}).`);
			throw error;
		} finally {
			refreshPromise = undefined;
		}
	})();

	return refreshPromise;
}

/** Return the prepared role-specific data, refreshing only if no valid snapshot exists. */
export async function getStrategiesPageData(fetch: Fetch, admin: boolean): Promise<StrategiesVariant> {
	await initialiseCache();
	if (!snapshot) await refreshStrategiesPageData(fetch);
	if (!snapshot) throw new Error('Strategies page cache refresh did not produce a snapshot.');
	return admin ? snapshot.admin : snapshot.public;
}

/** Safe state for protected diagnostics and refresh responses. */
export function getStrategiesPageCacheStatus() {
	const ageMs = snapshot ? Math.max(0, Date.now() - snapshot.updatedAt.valueOf()) : undefined;
	return {
		updatedAt: snapshot?.updatedAt.toISOString(),
		ageSeconds: ageMs === undefined ? undefined : Math.floor(ageMs / 1000),
		fresh: ageMs !== undefined && ageMs < STRATEGIES_PAGE_CACHE_TTL_MS,
		refreshing: Boolean(refreshPromise),
		source: cacheSource,
		persistent: persistentCacheAvailable,
		lastRefreshAt: lastRefreshAt?.toISOString(),
		lastRefreshError
	};
}

/** Test-only reset hook; not imported by application routes. */
export function resetStrategiesPageCacheForTests(directory?: string) {
	cacheDirectory = directory ?? env.TS_PRIVATE_STRATEGIES_CACHE_DIR ?? join(process.cwd(), '.cache', 'strategies');
	snapshot = undefined;
	initialisePromise = undefined;
	persistentCacheAvailable = true;
	refreshPromise = undefined;
	cacheSource = 'empty';
	lastRefreshAt = undefined;
	lastRefreshError = undefined;
}
