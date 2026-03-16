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
  - Defined in [src/routes/+page.ts](/Users/moo/code/frontend/src/routes/+page.ts)
- API executor metadata SWR cache: 60 seconds
  - Defined in [src/lib/trade-executor/client/strategy-info.ts](/Users/moo/code/frontend/src/lib/trade-executor/client/strategy-info.ts)
- YAML tile share-price SWR cache: 3600 seconds
  - Defined in [src/lib/strategies/yaml/share-price.ts](/Users/moo/code/frontend/src/lib/strategies/yaml/share-price.ts)
- Top vaults upstream feed timestamp:
  - Read from `generated_at` in the top-vaults payload

### YAML strategy overview page

- Vault summary metrics come from the top-vaults feed
  - Loaded in [src/routes/strategies/[strategy=yamlStrategy]/+layout.ts](/Users/moo/code/frontend/src/routes/strategies/[strategy=yamlStrategy]/+layout.ts)
- The chart fetches `/trading-view/vaults/:id/metrics` client-side after hydration
  - Implemented in [src/lib/top-vaults/VaultPriceChart.svelte](/Users/moo/code/frontend/src/lib/top-vaults/VaultPriceChart.svelte)
- The frontend app code does not add SWR caching to this chart request

## Hidden diagnostics in page source

To make freshness visible without changing the UI, pages now render hidden debug payloads:

- Homepage: `data-debug-freshness="home-page"`
- YAML strategy pages: `data-debug-freshness="yaml-strategy:<slug>"`

These markers are rendered by [src/lib/components/DebugFreshnessData.svelte](/Users/moo/code/frontend/src/lib/components/DebugFreshnessData.svelte) as hidden `<pre>` elements so they are:

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
JSON.parse(document.querySelector('[data-debug-freshness="home-page"]')?.textContent ?? 'null')
```

Example for a YAML strategy page:

```js
JSON.parse(document.querySelector('[data-debug-freshness="yaml-strategy:ichi-hyperliquid"]')?.textContent ?? 'null')
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

- [docs/cache-invalidation.md](/Users/moo/code/frontend/docs/cache-invalidation.md)
