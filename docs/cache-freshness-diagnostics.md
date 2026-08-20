# Cache freshness diagnostics

## Why this exists

Some pages combine data from multiple sources with different cache windows.
This can make two views of the same vault look temporarily inconsistent.

The Ichi Hyperliquid case is the motivating example:

- The homepage strategy tile is rendered on the server
- The YAML strategy overview page uses top-vault summary data for metrics
- The vault price chart on the strategy page fetches its own time series in the browser

If those sources are refreshed at different times, the homepage and detail page can disagree even when the code is working as designed.

## Relevant cache layers

### Homepage

- `/` HTML edge cache: 30 minutes
  - Defined in [src/routes/+page.ts](../src/routes/+page.ts)
- API executor metadata SWR cache: 60 seconds
  - Defined in [src/lib/trade-executor/client/strategy-info.ts](../src/lib/trade-executor/client/strategy-info.ts)
- YAML tile share-price SWR cache: 3600 seconds
  - Defined in [src/lib/strategies/yaml/share-price.ts](../src/lib/strategies/yaml/share-price.ts)
- Top vaults upstream feed timestamp:
  - Read from `generated_at` in the top-vaults payload

### YAML strategy overview page

- Vault summary metrics come from the top-vaults feed
  - Loaded in [src/routes/strategies/[strategy=yamlStrategy]/+layout.ts](../src/routes/strategies/[strategy=yamlStrategy]/+layout.ts)
- The chart fetches `/vaults/:id/metrics` client-side after hydration
  - Implemented in [src/lib/top-vaults/VaultPriceChart.svelte](../src/lib/top-vaults/VaultPriceChart.svelte)
- The frontend app code does not add SWR caching to this chart request

### Strategies listing page

- `/strategies` uses a versioned filesystem snapshot for its complete public
  and admin listing payloads. The admin variant additionally includes TVL
  data; the public variant never receives it.
- A snapshot has a 30-minute freshness target and the adapter-node process
  refreshes it every 20 minutes through a protected local endpoint. The page
  deliberately serves the last known-good snapshot while a refresh fails; it
  does not start request-scoped background work for visitors.
- A successful snapshot is retained when the top-vault source cannot be
  refreshed. Individual executor metadata failures retain the listing's
  existing disconnected-tile behaviour. When the snapshot is older than 30
  minutes, visitors still receive it until the next scheduled refresh succeeds.
- In Compose, the snapshot lives in the `strategies-cache` named volume at
  `/app/cache/strategies`, separate from the read-only `/app/data` mount. It
  persists ordinary container replacement on one Docker host; `docker compose
down -v` intentionally removes it.
- The cache automatically falls back to in-memory operation with a warning if
  the configured directory is not writable. It never stores visitor cookies,
  authorisation headers, IP-country data, or the scheduler token.
- Vite development and preview servers do not run the adapter-node scheduler.
  Their local `.cache/strategies` snapshot is therefore refreshed only after it
  is removed or the server starts without a snapshot; use production Compose
  for scheduled-refresh verification.

For operational diagnostics, inspect the container log entries prefixed
`[strategies-cache]`. The scheduler generates a per-process bearer token and
uses it only for its loopback `POST /_internal/cache/strategies/refresh`
request; do not treat that bearer-protected endpoint as a public cache-control
API.

## Hidden diagnostics in page source

To make freshness visible without changing the UI, pages now render hidden debug payloads:

- Homepage: `data-debug-freshness="home-page"`
- YAML strategy pages: `data-debug-freshness="yaml-strategy:<slug>"`

These markers are rendered by [src/lib/components/DebugFreshnessData.svelte](../src/lib/components/DebugFreshnessData.svelte) as hidden `<pre>` elements so they are:

- visible in page source
- inspectable in DevTools
- ignored by normal users

## What the diagnostics include

### Homepage payload

- `renderedAt`
- `httpEdgeCacheTtlSeconds`
- `apiStrategiesCache.ttlSeconds`
- `apiStrategiesCache.ageSeconds`
- `topVaultsFeed.generatedAt`
- `topVaultsFeed.ageSeconds`
- `yamlTileSharePriceCache.ttlSeconds`
- Per-YAML-strategy tile data:
  - `strategyId`
  - `vaultId`
  - `sharePriceCacheAgeSeconds`
  - `sharePriceCacheTtlSeconds`
  - `sharePriceSeriesEndAt`

### YAML strategy payload

- `renderedAt`
- `topVaultsFeed.generatedAt`
- `topVaultsFeed.ageSeconds`
- `vaultSummary.vaultId`
- `vaultSummary.lastUpdatedAt`
- `vaultChart.endpoint`
- `vaultChart.cacheNote`

## How to inspect

### Browser source

Open the page source and search for:

- `data-debug-freshness="home-page"`
- `data-debug-freshness="yaml-strategy:ichi-hyperliquid"`

### DevTools console

Example for the homepage:

```js
JSON.parse(document.querySelector('[data-debug-freshness="home-page"]')?.textContent ?? 'null');
```

Example for a YAML strategy page:

```js
JSON.parse(document.querySelector('[data-debug-freshness="yaml-strategy:ichi-hyperliquid"]')?.textContent ?? 'null');
```

## Interpreting mismatches

If the homepage tile and strategy page disagree:

1. Check `topVaultsFeed.generatedAt`
2. Check the tile `sharePriceCacheAgeSeconds`
3. Check whether the strategy page chart is using fresher client-fetched data

The most common explanation is not a rendering bug but a freshness gap between:

- edge-cached HTML
- in-process SWR caches
- live client-side chart fetches

## Related docs

- [Cache invalidation](cache-invalidation.md)
