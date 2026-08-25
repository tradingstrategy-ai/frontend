# Strategies page filesystem cache plan

## Goal

Cache every data dependency needed to render `/strategies` for 30 minutes, persist the cache across frontend container restarts, and refresh it in the background every 20 minutes. A warm or stale filesystem entry must let the page render without waiting for executor metadata, top-vault, share-price, or admin TVL requests.

Keep the existing security behaviour: the public page must only receive live strategies, the admin page may receive unpublished strategies and TVL data, and the route must not gain shared HTTP caching because its output depends on admin state and IP-country blocking.

## Current behaviour and constraints

- `src/routes/strategies/+page.server.ts` fetches API strategy metadata, YAML strategy enrichment, and admin TVL data during each server load.
- API metadata uses `getCachedStrategies`, an in-process SWR cache with a 60-second TTL. Its first request after a process restart waits for all executor metadata requests.
- YAML strategies fetch the top-vault feed and relative `/vaults/:id/metrics` endpoints. A background job outside a SvelteKit request cannot safely reuse this code with bare `globalThis.fetch`, because the relative metrics URLs require SvelteKit's request-aware `event.fetch`.
- The custom adapter-node entry point is `scripts/server.js`. It can run a process-local timer after Express starts listening.
- The production Compose service currently mounts `./data` at `/app/data` read-only. It has no writable persistent cache volume.
- Strategy data contains `Date` objects. Plain `JSON.parse(JSON.stringify(data))` would silently turn them into strings, so the persistent format needs an explicit codec and validation.
- The working tree already contains a separate `/strategies` payload optimisation. Preserve those changes and run role-specific sorting and tile compaction before writing or returning page variants.

## Cache contract

Create a server-only strategies page cache module, for example `src/lib/strategies/page-cache.server.ts`, with these constants:

- Fresh TTL: 30 minutes.
- Scheduled refresh interval: 20 minutes.
- Cache format version: an integer incremented when the persisted shape changes.
- Default development cache directory: a gitignored local cache directory outside `static/` and any other web-served tree.
- Production cache directory: supplied by `TS_PRIVATE_STRATEGIES_CACHE_DIR`, set to `/app/cache/strategies` in Compose.

Persist one versioned snapshot containing both already-prepared variants:

```ts
type StrategiesPageCacheSnapshot = {
	version: number;
	updatedAt: Date;
	public: {
		strategies: StrategyInfo[];
	};
	admin: {
		strategies: StrategyInfo[];
		tvlData?: PerformanceData;
	};
};
```

Build both variants from a single refresh operation:

1. Fetch all API strategy metadata directly, bypassing the old request-triggered 60-second cache.
2. Fetch and enrich all configured YAML strategies once using top-vault data and share-price returns.
3. Fetch admin TVL data in parallel with the other independent sources.
4. Derive the public variant by filtering API and YAML strategies to `live` tags.
5. Derive the admin variant from all fetched strategies.
6. Sort each variant and apply the existing chart-range/tile-payload compaction independently, since the public and admin strategy sets can have different ranges.
7. Mark the snapshot successful only after all required strategy sources are complete. Treat TVL as optional, matching current behaviour.

Use `devalue` or an equivalently explicit codec so `Date` and `undefined` values survive persistence. Validate the envelope, version, timestamps, role variants, and strategy data after decoding. A corrupt or incompatible file is a cache miss, never trusted data.

Expose a narrow API:

- `getStrategiesPageData(fetch, admin)`: load the disk snapshot into memory once, return the appropriate fresh variant, and await a credential-neutral refresh only when no valid snapshot exists.
- `refreshStrategiesPageData(fetch)`: force an upstream refresh even when the current snapshot is younger than 30 minutes; used by the 20-minute scheduler.
- `getStrategiesPageCacheStatus()`: return timestamps, age, refresh state, source (`memory`, `filesystem`, or `upstream`), and last refresh error for private diagnostics. Never expose the bearer token or filesystem path in page data.

All cache-building fetches must be credential-neutral. Wrap the supplied SvelteKit fetch so it resolves relative URLs but explicitly omits credentials and strips `cookie`, `authorization`, and request-specific forwarding headers. Do not allow `locals.admin`, visitor cookies, IP-country, or other request state to influence a snapshot. The same wrapper is used for a rare no-snapshot request fallback and for the internal scheduled refresh.

Freshness and failure semantics:

- Age under 30 minutes: serve immediately.
- Age at or over 30 minutes: serve stale immediately and record that refresh is overdue; do not detach request-scoped work after returning a visitor response. The internal scheduler remains the normal refresh trigger.
- Scheduled refresh: force refresh every 20 minutes so a healthy cache normally never reaches the 30-minute stale boundary.
- Upstream refresh failure: retain and serve the last good snapshot, record/log the error, and retry at the next scheduled interval or an explicit internal refresh.
- No valid snapshot anywhere: the first request must await one credential-neutral upstream refresh, preserving the current cold-start fallback without persisting visitor identity.
- Never replace a good snapshot with a partial or failed refresh.

Keep one in-process snapshot in front of the file to avoid filesystem reads on normal requests. Write a uniquely named temporary file in the cache directory, flush/close it, and atomically rename it over the final path. Clean abandoned temporary files on startup, ignoring cleanup failures. Use single-flight refresh protection in-process. Document that the Compose deployment has one frontend process; if multiple writers are introduced later, add an inter-process lock or move the cache to R2/Redis rather than relying only on atomic rename.

If the configured directory cannot be created or written, log a clear startup warning and degrade to the same in-memory cache semantics rather than crashing the frontend. The persistent-cache status must report this degraded mode.

## Background refresh process

Add a protected SvelteKit endpoint such as `POST /_internal/cache/strategies/refresh` that:

- Rejects other methods.
- Requires a per-process bearer token.
- Calls `refreshStrategiesPageData(event.fetch)`, ensuring existing relative internal fetches and `handleFetch` behaviour continue to work.
- Returns concise status and timing JSON, without returning cached strategy contents.
- Sets `cache-control: private, no-store`.

Update `scripts/server.js` to:

1. Generate a random internal refresh token before dynamically importing `build/handler.js`, and expose it only through a private process environment variable read by the endpoint.
2. Start Express as today.
3. Trigger the protected local endpoint once after the server begins listening.
4. Trigger it every 20 minutes with `setInterval` and `timer.unref()`.
5. Prevent overlapping refresh calls. Keep the endpoint request open until the refresh completes; bound individual upstream operations and the overall refresh below a documented maximum, then give the scheduler's local HTTP request a comfortably larger timeout (for example, a 10-minute refresh budget and a 15-minute caller timeout). Do not abort a healthy refresh merely because it is slower than an ordinary page request.
6. Log success duration/cache timestamp and failures, without crashing or blocking the HTTP server.

This keeps the scheduler in the long-lived adapter-node process while the refresh itself runs inside a normal SvelteKit request context. The random token avoids adding a deployment-managed secret and prevents a public caller from forcing expensive refreshes.

The internal route still passes through the application's global server hooks, which is desirable for tracing. It is not nested below the geo-blocked strategies layout and therefore must not depend on geo or admin locals. Configure the local request's host/origin consistently with adapter-node's production settings so relative `event.fetch` URLs resolve to the same local server. Cover the actual built handler and hook chain in the container test rather than assuming unit-level endpoint tests are sufficient.

## Remove the 60-second cache from the page path

- Stop `/strategies` from using the current 60-second `getCachedStrategies` wrapper; its complete page snapshot uses the requested 30-minute TTL.
- Ensure the page-cache refresher performs a true upstream refresh by calling the uncached strategy fetch operation. Simply calling an SWR wrapper from the 20-minute timer can re-persist old data while resetting the file timestamp.
- Leave the homepage, sitemap, and TVL endpoint on their current cache policy unless a separate product decision explicitly opts them into 30-minute freshness. Increasing the shared wrapper globally would silently change those consumers and is not required to satisfy the `/strategies` page cache.
- Update page cache-age diagnostics and comments so `/strategies` no longer reports or implies the 60-second cache.

## Docker and Compose changes

Update `Dockerfile` to create the runtime cache directory with permissions suitable for the runtime user. Keep the directory separate from immutable application code and the read-only vault dataset. Because an existing named volume can retain older ownership, check writability at application startup and degrade to memory-only caching with an explicit warning rather than failing the container.

Update `docker-compose.yml`:

```yaml
services:
  frontend:
    volumes:
      - ./data:/app/data:ro
      - strategies-cache:/app/cache
    environment:
      - TS_PRIVATE_STRATEGIES_CACHE_DIR=/app/cache/strategies

volumes:
  strategies-cache:
```

The named volume persists across normal image/container replacement on the same Docker host. Document that `docker compose down -v` deliberately deletes it and that it is not a cross-host distributed cache.

Ensure all runtime modules needed by the cache codec and file writer remain available after `pnpm prune --prod`. In particular, keep `devalue` in `dependencies`, not `devDependencies`. If the scheduler is extracted from `scripts/server.js`, explicitly copy the added runtime script in the Dockerfile.

## Route integration

Refactor `src/routes/strategies/+page.server.ts` so its load function only:

1. Reads `locals.admin`.
2. Calls `getStrategiesPageData(fetch, Boolean(admin))`.
3. Returns the already-prepared role variant.

Do not set public page response cache headers. Keep geo-blocking in the existing strategies layout. Do not persist passwords, cookies, IP-country values, request headers, or other per-request information in the filesystem snapshot.

## Observability and documentation

- Log structured refresh start, success, failure, duration, source count, snapshot age, and cache path. Do not log full strategy payloads or the bearer token.
- Extend the existing hidden freshness diagnostics with safe filesystem snapshot fields such as `updatedAt`, age, source, last successful background refresh, and a sanitised last-error summary. Never serialise the cache path or refresh token to a public page.
- Update `docs/cache-freshness-diagnostics.md` from 60 seconds to 30 minutes and describe the 20-minute scheduled refresh and stale-on-error behaviour.
- Add a short operational note covering the Compose volume, manual cache removal, expected startup behaviour, and how to invoke the protected refresh from inside the container for diagnostics without exposing its token.

## Tests and verification

Add focused unit tests with an injectable cache directory, clock, fetch implementation, and scheduler callback:

- Cold cache fetches upstream, prepares public/admin variants, preserves `Date` values, and atomically writes a versioned snapshot.
- A fresh file snapshot is loaded after simulated process restart without upstream requests.
- Public data excludes unpublished strategies while admin data includes them and receives TVL data.
- A scheduled force refresh at 20 minutes updates the snapshot even though its 30-minute TTL has not expired.
- Concurrent page requests and a scheduler tick share one refresh promise.
- A stale snapshot is returned immediately without starting visitor-scoped detached work; the scheduled internal refresh updates it.
- Refresh fetches omit cookies and authorisation, and admin/non-admin visitor requests cannot change the generated shared snapshot.
- Failed or partial refreshes leave the last good file and memory snapshot unchanged.
- Corrupt, truncated, or wrong-version files are ignored safely and replaced after a successful refresh.
- Atomic write tests confirm readers see either the old complete snapshot or the new complete snapshot, not a partial file.
- The internal endpoint rejects missing/incorrect tokens, accepts the server token, does not expose data, and uses `private, no-store`.
- The scheduler starts once, runs immediately and every 20 minutes, does not overlap, catches errors, gives refreshes enough time to finish, and does not keep shutdown alive.
- SIGTERM during a refresh can leave only an ignorable uniquely named temporary file; the next start removes abandoned temporary files and continues using the last complete snapshot.

Run:

- Focused Vitest tests for the page cache, codec, endpoint, and scheduler.
- Existing strategy sorting/chart compaction tests.
- The strategies integration test with mock APIs.
- ESLint and Prettier on changed files.
- `pnpm run check`, reporting unrelated baseline diagnostics separately if they remain.
- `docker compose config` and a production image build.
- A container smoke test that verifies `/app/cache/strategies` is writable and that a token-authenticated refresh succeeds through the built handler, real hook chain, and production host/origin settings before creating the snapshot in the named volume.
- A degraded-mode container test (or focused filesystem test) showing an unwritable cache path logs a warning and continues with memory-only caching.

Finally, use Playwright against the Tailscale-exposed development server to verify public and admin variants still render correctly. Measure three scenarios: cold with no file, process restart with a persisted file, and scheduled refresh while serving the last good snapshot. Record TTFB, FCP/LCP, document transfer size, cache source, snapshot age, and upstream request counts.

## Acceptance criteria

- `/strategies` uses a 30-minute persistent cache for all page data and no longer depends on a 60-second page-data cache.
- A successful refresh runs every 20 minutes without blocking page requests.
- A normal container replacement serves the persisted snapshot before upstream requests finish.
- Public/admin separation and geo-blocking behaviour are unchanged.
- Refresh failures never destroy or replace the last good snapshot.
- The cache file is versioned, validated, and atomically replaced.
- The writable named volume is separate from `/app/data:ro` and documented as single-host persistence.
- Focused tests, container smoke checks, and before/after performance measurements demonstrate the behaviour.
