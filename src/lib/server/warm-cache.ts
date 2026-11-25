/**
 * Server-side caches that a background job keeps warm, so a visitor's request never waits
 * for an upstream download or rebuild once the process has loaded a value.
 *
 * - `get()` returns the current value. It waits for a load only when the key has never
 *   loaded (cold process, first request for a key).
 * - `refresh()` reloads a key, single-flight, and replaces the value only on success: a
 *   failed refresh keeps serving the previous value and is reported by `status()`.
 * - The cache-warmer job (`$lib/server/cache-warmer`) calls `refreshDue()` on every cache
 *   once an hour. `get()` starts a background refresh by itself only as a fallback when a
 *   value has gone unrefreshed for twice its interval (the warmer is broken) or when a
 *   derived cache's inputs have changed, and retries a failing upstream with exponential
 *   backoff instead of on every request.
 * - Keyed caches (one entry per protocol, chart key …) keep at most `maxEntries` entries,
 *   evicting the least recently read.
 *
 * Loaders must throw when their source is unavailable. Returning an empty "success" (an
 * empty list on a failed fetch) would replace good data.
 *
 * Every cache registers itself so `/diagnostics` and the warmer can list them.
 */

/**
 * Exponential backoff after a failed load: 15 s, 30 s, 1 min … at most 30 min. During it a
 * key that has a value keeps serving it, and a key that has never loaded fails fast with
 * the last error instead of making every visitor wait for a source that is down.
 */
const BACKOFF_BASE_MS = 15_000;
const BACKOFF_MAX_MS = 30 * 60_000;

/** A refresh is due when the value is this close to its interval, to absorb scheduler jitter. */
const DUE_FRACTION = 0.9;

/** Keyed caches drop entries nobody has read for this long instead of refreshing them. */
const DEFAULT_IDLE_TTL_MS = 24 * 60 * 60 * 1000;

export type WarmCacheLoader<V> = (key: string, fetch: Fetch, signal?: AbortSignal) => Promise<V>;

export interface WarmCacheOptions<V> {
	/** Unique name, shown on `/diagnostics` and in warmer results. */
	name: string;
	/** Load a fresh value. Must throw when the source is unavailable. */
	load: WarmCacheLoader<V>;
	/** How often the value should be refreshed. */
	refreshIntervalMs: number;
	/** Source data older than this is reported as `degraded`. */
	maxSourceAgeMs?: number;
	/** When the source data was produced (for example the export's `generated_at`). */
	sourceTime?: (value: V) => Date | string | null | undefined;
	/**
	 * Current version of the inputs a derived cache is built from. When it differs from the
	 * version the value was built with, `get()` rebuilds in the background.
	 */
	inputVersion?: () => string;
	/** Keyed caches: at most this many entries, least recently read evicted first. */
	maxEntries?: number;
	/** Keyed caches: entries not read for this long are dropped by `refreshDue()` (default 24 h). */
	idleTtlMs?: number;
}

interface Entry<V> {
	hasValue: boolean;
	value?: V;
	updatedAt?: number;
	inputVersion?: string;
	loading?: Promise<V>;
	lastDurationMs?: number;
	lastError?: string;
	lastErrorCause?: unknown;
	failures: number;
	retryAt: number;
	lastReadAt: number;
}

export type WarmCacheState = 'fresh' | 'stale' | 'degraded' | 'loading' | 'never loaded';

export interface WarmCacheEntryStatus {
	cache: string;
	key: string;
	state: WarmCacheState;
	ageSeconds: number | null;
	sourceAgeSeconds: number | null;
	lastDurationMs: number | null;
	lastError: string | null;
	failures: number;
}

export interface WarmCache<V> {
	readonly name: string;
	readonly refreshIntervalMs: number;
	/** Current value; waits only when the key has never loaded. */
	get(fetch: Fetch, key?: string): Promise<V>;
	/** Reload a key now (single-flight); keeps the previous value on failure and rethrows. */
	refresh(fetch: Fetch, key?: string, signal?: AbortSignal): Promise<V>;
	/** Refresh every known key whose value is due (or every key with `force`); drop idle keyed entries. */
	refreshDue(fetch: Fetch, signal?: AbortSignal, force?: boolean): Promise<void>;
	/** Keys that have been requested or warmed. */
	keys(): string[];
	/** Version string that changes whenever any key's value is replaced. */
	version(): string;
	status(): WarmCacheEntryStatus[];
	/** Drop all entries (tests). */
	clear(): void;
}

const registry = new Map<string, WarmCache<unknown>>();

/** All caches created in this process, in creation order. */
export function listWarmCaches(): WarmCache<unknown>[] {
	return [...registry.values()];
}

/** Status of every entry of every cache, for `/diagnostics`. */
export function getWarmCacheStatus(): WarmCacheEntryStatus[] {
	return listWarmCaches().flatMap((cache) => cache.status());
}

/** Fetch that never forwards the visitor's cookies, for loads that outlive a request. */
function credentialNeutral(fetch: Fetch): Fetch {
	return (input, init) => fetch(input, { ...init, credentials: 'omit' });
}

/** A 4xx from a loader means the key does not exist (unknown slug), not that the source failed. */
function isClientError(error: unknown) {
	const status = error && typeof error === 'object' && 'status' in error ? Number(error.status) : NaN;
	return status >= 400 && status < 500;
}

function errorSummary(error: unknown) {
	if (error instanceof Error) return `${error.name}: ${error.message}`;
	if (error && typeof error === 'object' && 'status' in error) return `HTTP ${(error as { status: unknown }).status}`;
	return 'Unknown error';
}

/**
 * Create a cache kept warm by the background warmer.
 *
 * @param options see `WarmCacheOptions`
 */
export function createWarmCache<V>(options: WarmCacheOptions<V>): WarmCache<V> {
	const { name, load, refreshIntervalMs, maxSourceAgeMs, sourceTime, inputVersion, maxEntries } = options;
	const idleTtlMs = maxEntries ? (options.idleTtlMs ?? DEFAULT_IDLE_TTL_MS) : Infinity;
	const entries = new Map<string, Entry<V>>();
	let generation = 0;

	function entryFor(key: string): Entry<V> {
		let entry = entries.get(key);
		if (!entry) {
			entry = { hasValue: false, failures: 0, retryAt: 0, lastReadAt: Date.now() };
			entries.set(key, entry);
			evict();
		}
		return entry;
	}

	function evict() {
		if (!maxEntries || entries.size <= maxEntries) return;
		const idle = [...entries.entries()]
			.filter(([, entry]) => !entry.loading)
			.toSorted(([, a], [, b]) => a.lastReadAt - b.lastReadAt);
		for (const [key] of idle.slice(0, entries.size - maxEntries)) entries.delete(key);
	}

	function startLoad(key: string, entry: Entry<V>, fetch: Fetch, signal?: AbortSignal): Promise<V> {
		const startedAt = performance.now();
		const builtFrom = inputVersion?.();
		const loading = load(key, fetch, signal).then(
			(value) => {
				entry.value = value;
				entry.hasValue = true;
				entry.updatedAt = Date.now();
				entry.inputVersion = builtFrom;
				entry.lastDurationMs = Math.round(performance.now() - startedAt);
				entry.lastError = undefined;
				entry.lastErrorCause = undefined;
				entry.failures = 0;
				entry.retryAt = 0;
				generation++;
				return value;
			},
			(error: unknown) => {
				// do not keep (or keep retrying) keys that do not exist
				if (!entry.hasValue && isClientError(error)) {
					if (entries.get(key) === entry) entries.delete(key);
					throw error;
				}
				entry.lastDurationMs = Math.round(performance.now() - startedAt);
				entry.lastError = errorSummary(error);
				entry.lastErrorCause = error;
				entry.failures++;
				entry.retryAt = Date.now() + Math.min(BACKOFF_MAX_MS, BACKOFF_BASE_MS * 2 ** (entry.failures - 1));
				throw error;
			}
		);
		entry.loading = loading;
		// clear the in-flight marker however the load ends; the rejection itself is handled by callers
		loading.then(
			() => (entry.loading = undefined),
			() => (entry.loading = undefined)
		);
		return loading;
	}

	function isOverdue(entry: Entry<V>, now: number) {
		if (entry.updatedAt === undefined) return true;
		if (now - entry.updatedAt > 2 * refreshIntervalMs) return true;
		return inputVersion !== undefined && entry.inputVersion !== inputVersion();
	}

	const cache: WarmCache<V> = {
		name,
		refreshIntervalMs,

		async get(fetch, key = '') {
			const entry = entryFor(key);
			const now = Date.now();
			entry.lastReadAt = now;

			if (entry.hasValue) {
				if (!entry.loading && now >= entry.retryAt && isOverdue(entry, now)) {
					startLoad(key, entry, credentialNeutral(fetch)).catch((error) => {
						console.error(
							`[warm-cache] ${name}${key ? ` ${key}` : ''}: background refresh failed (${errorSummary(error)})`
						);
					});
				}
				return entry.value as V;
			}

			if (entry.loading) return entry.loading;
			// a source that just failed is not retried on every request until its backoff ends
			if (now < entry.retryAt && entry.lastErrorCause !== undefined) throw entry.lastErrorCause;
			return startLoad(key, entry, fetch);
		},

		async refresh(fetch, key = '', signal) {
			const entry = entryFor(key);
			if (entry.loading) return entry.loading;
			return startLoad(key, entry, credentialNeutral(fetch), signal);
		},

		async refreshDue(fetch, signal, force = false) {
			const now = Date.now();
			const failures: string[] = [];
			for (const [key, entry] of [...entries.entries()]) {
				signal?.throwIfAborted();
				if (now - entry.lastReadAt > idleTtlMs && !entry.loading) {
					entries.delete(key);
					continue;
				}
				const due =
					force ||
					entry.updatedAt === undefined ||
					now - entry.updatedAt >= DUE_FRACTION * refreshIntervalMs ||
					(inputVersion !== undefined && entry.inputVersion !== inputVersion());
				if (!due) continue;
				try {
					await cache.refresh(fetch, key, signal);
				} catch (error) {
					failures.push(`${key || name}: ${errorSummary(error)}`);
				}
			}
			if (failures.length) throw new Error(`${failures.length} refresh(es) failed: ${failures.join('; ')}`);
		},

		keys() {
			return [...entries.keys()];
		},

		version() {
			return `${name}:${generation}`;
		},

		status() {
			const now = Date.now();
			return [...entries.entries()].map(([key, entry]) => {
				const ageSeconds = entry.updatedAt === undefined ? null : Math.round((now - entry.updatedAt) / 1000);
				const source = entry.hasValue && sourceTime ? sourceTime(entry.value as V) : null;
				const sourceMs = source ? new Date(source).valueOf() : NaN;
				const sourceAgeSeconds = Number.isNaN(sourceMs) ? null : Math.max(0, Math.round((now - sourceMs) / 1000));

				let state: WarmCacheState;
				if (!entry.hasValue) state = entry.loading ? 'loading' : 'never loaded';
				else if (
					maxSourceAgeMs !== undefined &&
					((sourceAgeSeconds ?? 0) * 1000 > maxSourceAgeMs || (ageSeconds ?? 0) * 1000 > maxSourceAgeMs)
				)
					state = 'degraded';
				else if (entry.lastError || isOverdue(entry, now)) state = 'stale';
				else state = 'fresh';

				return {
					cache: name,
					key,
					state,
					ageSeconds,
					sourceAgeSeconds,
					lastDurationMs: entry.lastDurationMs ?? null,
					lastError: entry.lastError ?? null,
					failures: entry.failures
				};
			});
		},

		clear() {
			entries.clear();
			generation++;
		}
	};

	if (registry.has(name)) console.warn(`[warm-cache] duplicate cache name "${name}"; the newer one is listed`);
	registry.set(name, cache as WarmCache<unknown>);
	return cache;
}
