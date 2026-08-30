# Stop serving the full vault JSON to `/vaults`

> Implementation note: this scoped plan is complete. A later follow-up also replaced the chain overview's full-record page data with a server-calculated vault summary. Current behaviour is documented in `docs/vault-data-source.md`.

## Goal

Stop `/vaults/**` pages from downloading or embedding the complete
`top_vaults_by_chain.json`/`TopVaults` dataset in the browser.

The server continues to read the current JSON from private R2 or
`TS_PRIVATE_TOP_VAULTS_URL`, validate and normalise it, and cache it for one
hour. Pages that need the complete population for filtering, sorting, grouping,
aggregation, or pagination perform those calculations on the server and return
only the requested result.

## What this goal does and does not mean

Required:

- No normal `/vaults/**` page navigation requests `/top-vaults/all-data`.
- No `/vaults/**` server load serialises the complete `TopVaults` export into
  SvelteKit page data.
- Vault tables operate on server-filtered and server-sorted pages.
- Charts receive chart-specific points/series produced from the complete
  server-side dataset.
- Risk-rating pages receive server-calculated summaries and paginated rows.

Not required:

- Minimising the number of fields in an individual vault record.
- Introducing `VaultListingRow`, `VaultDetailView`, or other field-restricted
  DTOs solely to reduce payload size.
- Reworking vault detail pages that send one matched vault.
- Reworking group pages that already return calculated groups instead of the
  complete export.
- Replacing the existing R2/private-URL source, Zod schema, normalisation, or
  one-hour server cache.
- Refactoring current route-specific chart endpoints that already calculate
  their output on the server.
- Changing Parquet, DuckDB, metrics, historical-TVL, Treasury/FRED, Coinbase,
  strategy, trading-view, pricing, landing-page, search, social-card, or
  metadata-producer flows.

An individual detail response may contain a full `VaultInfo`. A listing page
may contain its existing first 125 full `VaultInfo` rows and continuation pages
of 50 full rows. A chart endpoint may return every chart point needed to render
the chart. The prohibited response is the unrestricted complete `TopVaults`
export or an equivalent complete vault-record array sent to `/vaults/**`.

The licensed `/vaults/datasets/download/vault-metadata` and allow-listed free
metadata sample are intentional download products and are exempt from this UI
rule.

## Current compliant paths

No redesign is needed for these paths:

- Standard vault listings already call `loadVaultListing()` on the server,
  render the first 125 matching rows, and fetch later 50-row pages through
  `/top-vaults/listing-data`.
- Listing filters, sorting, summaries, and pagination already run against the
  complete server-cached export.
- Vault detail pages load one matched vault on the server.
- Chain, protocol, stablecoin, and curator indexes already return calculated
  group rows.
- `/vaults/core3-risk`, stablecoin-chain heatmap, mini charts, and historical
  charts already use route-specific server endpoints.
- `/vaults/sitemap.xml` consumes the metadata only on the server and returns
  XML.
- Dataset download/sample routes intentionally proxy downloadable files.

The existing listing continuation behaviour remains:

- initial page size: 125 rows;
- continuation size: 50 rows;
- deterministic server ordering with canonical vault-ID tie-breaker;
- `generated_at` comparison between page zero and continuation requests;
- `409` when the export changes;
- `Cache-Control: private, no-store` on continuation responses.

## Pages to change

### 1. Metadata chart pages using the complete export

These five pages currently call `fetchAllVaultData()`, which downloads
`/top-vaults/all-data`:

- `/vaults/yield-risk`
- `/vaults/yield-chain`
- `/vaults/yield-protocol`
- `/vaults/current-peak-tvl`
- `/vaults/cumulative-tvl-apy`

For each page:

1. Add a route-local `chart-data/+server.ts` endpoint.
2. Read `getCachedTopVaults(fetch)` in the endpoint.
3. Move the calculations that require the complete population from the Svelte
   chart component into a pure server-callable builder.
4. Return chart-specific data, not `TopVaults`, `VaultInfo[]`, or
   `SlimVaultInfo[]`.
5. Keep presentation-only behaviour in the browser: formatting, CSS, tooltips,
   zoom, series visibility, and Plotly/ECharts configuration. Preserve the
   existing scatter palette while the server assigns colours to deterministic
   groups.
6. Pass interactive controls that change membership or values as validated
   endpoint query parameters. The browser discards superseded responses.
7. Reuse the existing one-hour `getCachedTopVaults()` snapshot; no additional
   derived cache or snapshot identifier is required for this migration.
8. Keep the existing `export const ssr = false` behaviour. These pages continue
   to load lazily in the browser, but fetch chart-specific server output instead
   of the complete vault export.

Server calculations by page:

| Page                         | Calculation moved server-side                                                                                                  |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `/vaults/yield-risk`         | Eligibility, blacklist filtering, minimum TVL, return availability, risk grouping, excluded count, and scatter points          |
| `/vaults/yield-chain`        | Eligibility, chain resolution, major/other grouping, deterministic group order, excluded count, and scatter points             |
| `/vaults/yield-protocol`     | Eligibility, supported-protocol filtering, major/other grouping, deterministic group order, excluded count, and scatter points |
| `/vaults/current-peak-tvl`   | Eligibility, current/peak values, selected grouping, extents, excluded count, and point links                                  |
| `/vaults/cumulative-tvl-apy` | Time-window return selection, minimum TVL, protocol filter/options, APY ordering, cumulative TVL, and vault chart points       |

`/vaults/cumulative-tvl-apy/+page.server.ts` already supplies savings and
Treasury rates. Leave benchmark fetching and the benchmark overlay unchanged;
they are not part of the vault JSON migration.

Chart responses are self-contained and use the serving instance's current
snapshot. They do not need to match the `/vaults/+layout.server.ts` version,
include an export timestamp, or return `409` during normal multi-instance
cache skew.

### 2. Risk-rating pages using the complete export

These two pages calculate their summary on the server but then call
`fetchAllVaultData()` in `RiskRatingsPage.svelte` to build the full table and
risk bands in the browser:

- `/vaults/core3-ratings`
- `/vaults/xerberus-ratings`

Fix them by extending the existing server listing pipeline:

1. Add `core3-ratings` and `xerberus-ratings` listing definitions.
2. Resolve CORE3 scores/grades into the existing compact per-vault `core3`
   summary before filtering and sorting. This preserves the existing
   `VaultInfo` row shape after `loadVaultListing()` strips the top-level
   `core3_protocols` registry. Xerberus values already reside on the vault
   assessment.
3. Add `provider_risk_rating` to the server comparator registry. Sort CORE3
   ascending and Xerberus descending, followed by the canonical vault-ID
   tie-breaker. Exclude unresolved rows before pagination.
4. Keep `TopVaultsTable.svelte` provider cells compatible with the compact
   per-vault CORE3 summary and Xerberus assessment. Its provider sort must not
   depend on the stripped registry or locally re-sort a paginated prefix.
5. Calculate provider summary statistics and TVL bands from the complete
   matching population on the server.
6. Return the existing initial 125 enriched rows plus the complete-result
   summary.
7. Apply the same provider enrichment and comparator in
   `/top-vaults/listing-data`, then return later rows in 50-row pages.
8. Preserve provider-specific default ordering and the canonical vault-ID
   tie-breaker.
9. Remove the `fetchAllVaultData()` effect from `RiskRatingsPage.svelte`.

No field-restricted row DTO is required. These pages may use the same full
`VaultInfo` row shape as the existing paginated vault listings.

### 3. API overview embedding the complete export

`/vaults/api/+page.server.ts` currently returns the complete `TopVaults`
payload even though `/vaults/api/+page.svelte` only displays the vault count.

Change the server load to calculate and return `vaultCount`. Do not include
`topVaults` in page data.

## Shared code and endpoints

### `client-cache.ts`

After the five chart pages and `RiskRatingsPage.svelte` stop using
`fetchAllVaultData()`, remove `src/lib/top-vaults/client-cache.ts` and its unit
test only after a fresh repository-wide import search returns zero production
consumers. Before the later cleanup, imports existed only in these six scoped
consumers and strategy position pages called `/top-vaults/all-data` directly.

### Generic endpoints

The initial migration left both generic endpoints out of scope. A subsequent
cleanup removed `/top-vaults/all-data`: strategy position pages now request
only matched vault records, and the pricing development fallback uses the slim
`/top-vaults/chart-data` payload. The landing-page ecosystem and diagnostics
continue to use `/top-vaults/chart-data`.

### Listing endpoint

Keep `/top-vaults/listing-data`. Extend its allow-listed listing definitions
for CORE3 and Xerberus ratings, including server enrichment and provider
sorting. Existing listing pages and their current `409` recovery do not
otherwise need migration.

## Tests

### Unit tests

- Server chart-builder parity for eligibility, grouping, ordering, values,
  counts, extents, cumulative TVL, and empty data.
- CORE3/Xerberus listing parity for eligibility, score resolution, provider
  ordering, summaries, risk bands, initial page, and continuation page.
- Provider pagination tests for stable ordering, the 125/50 limits, identical
  enrichment in initial/continuation rows, and the existing export-version
  conflict response.
- `/vaults/api` load test proving it returns `vaultCount` without `topVaults`.

### Integration and browser tests

- Direct tests for each new chart-data endpoint: successful schema, invalid
  query fallback, unavailable metadata, and empty data. Test compression/cache
  headers only on endpoints that implement them.
- Update the existing integration/browser tests for the five chart pages to
  assert their new route-specific endpoints. Add new integration/browser tests
  for the CORE3 and Xerberus rating pages.
- Network assertion that navigating any `/vaults/**` UI page does not request
  `/top-vaults/all-data` or `/top-vaults/chart-data`.
- SvelteKit page-data assertion that `/vaults/api` does not contain the complete
  vault array.
- Regression tests confirming existing paginated listings, vault detail pages,
  server-calculated group pages, licensed metadata download, and free sample
  still work.

Run:

```shell
pnpm run format
pnpm run check
pnpm run lint
pnpm run test:unit --run
pnpm run test:integration
pnpm run build
```

Manual browser verification uses `pnpm run dev`, not `pnpm run preview`.

## Delivery sequence

1. Add the five server chart builders and route-local endpoints.
2. Migrate the five metadata chart pages off `fetchAllVaultData()`.
3. Add provider listing definitions and migrate the two risk-rating pages to
   server summaries plus existing pagination.
4. Change `/vaults/api` to return only `vaultCount`.
5. Remove `client-cache.ts` after confirming zero imports.
6. Add the `/vaults/**` network/page-data regression assertions.

## Acceptance criteria

- No `/vaults/**` page requests `/top-vaults/all-data` or
  `/top-vaults/chart-data`.
- No `/vaults/**` SvelteKit page data contains the complete `TopVaults` export
  or an equivalent complete vault-record array, except explicit licensed/sample
  downloads.
- The five affected chart pages receive server-built chart data rather than the
  vault export.
- CORE3 and Xerberus rating pages use server summaries and 125/50 row
  pagination.
- `/vaults/api` receives only the count it displays.
- Existing listing pages, individual vault detail payloads, group payloads, and
  route-specific server charts are not refactored merely to reduce fields.
- Generic `/top-vaults` endpoints remain available for out-of-scope consumers.
- Parquet, historical metrics, benchmarks, strategies, trading view, pricing,
  landing page, search, social cards, and the metadata producer are unchanged.
