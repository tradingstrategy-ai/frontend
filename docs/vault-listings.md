# Vault listing pagination

Vault table pages render their first 125 matching rows in the SvelteKit server
load. This makes the initial listing visible without downloading the complete
vault export in the browser.

## Ordering and filtering

`src/lib/top-vaults/listing/` is the shared, browser-safe implementation of
the listing definitions, URL state parser, filters, and deterministic sorting.
Page loaders and the continuation endpoint call the same query function. The
table uses the exported sorter over its accumulated rows, so equal sort values
use the same canonical vault-ID tie-breaker on both sides.

Each listing has a fixed definition (`top`, `chain`, `protocol`,
`stablecoin`, `curator`, `tokenised-funds`, and the special listings). URL
filters may narrow that definition but cannot change its base population.

### Permissioned vault filter

The Filters panel labels the permissioned-vault control **Hide private**. It
adds `private=1` to the URL and excludes every vault with a `whitelisted`
deposit status. This includes tokenised funds: they are displayed as **Fund**
in the table, but still require permission to deposit. The label refers to the
deposit restriction, not the table's status text. It is not shown on the
Whitelisted listing because every vault in that listing is permissioned.

## Continuation API

`GET /top-vaults/listing-data` returns the next 50 rows. It accepts the normal
listing filter query parameters plus:

| Parameter     | Required         | Description                                                                                 |
| ------------- | ---------------- | ------------------------------------------------------------------------------------------- |
| `listing`     | No               | Listing key; defaults to `top`.                                                             |
| `scope`       | Dynamic listings | Route-provided chain, protocol, stablecoin, or curator slug. Unknown values return no rows. |
| `offset`      | No               | Non-negative number of rows already received; defaults to `0`.                              |
| `version`     | No               | Initial page `generated_at` timestamp. A changed export produces `409`.                     |
| `blacklisted` | No               | Set to `1` to return only blacklisted rows that match the current listing filters.          |

A successful response contains `vaults`, `nextOffset`, `hasMore`,
`generatedAt`, and the full listing summary. Responses use `Cache-Control:
private, no-store`. On `409`, the table refreshes the current URL through
client navigation to obtain a fresh server-rendered first batch.

Once all default rows are visible, a listing with hidden blacklisted vaults
shows a centred **Show X blacklisted vaults** control below the table. It fetches
only the matching blacklisted rows, changes the displayed risk level to
**Blacklisted**, and updates the URL without a document reload. Additional
blacklisted rows continue loading in 50-row batches when needed.

`/top-vaults/all-data` remains available for chart pages that genuinely need
the complete export. Vault table pages must not use it after hydration.

## Page metadata and overview panels

The server sends compact full-result aggregates with the first row batch.
Listing counts, TVL, weighted returns, and SEO item counts must use those
aggregates, not the initial 125 rows. Charts that need every member receive a
separate, purpose-built payload rather than reusing table rows.

Summary calculations use the same scope and filters as the listing. They omit
blacklisted vaults by default, even on listings that display them; the dedicated
blacklisted listing explicitly includes its matching vaults in its own summary.
This keeps headline TVL and returns aligned with the established listing rules.
The server resolves the cached US Treasury rate when that monthly-return filter
is selected, so the initial batch and continuation requests apply the same rule.

## Stablecoin safety notices

Stablecoin detail pages show a red notice when stablecoin metadata identifies a likely depeg. When a native peg rate is available, the notice shows the inverse rate as token units per one unit of the peg currency and its fetch time.

If metadata reports `rate_fetch_failed_reason: missing_coingecko_id`, the page instead shows a yellow notice explaining that a price feed is unavailable. It does not present a peg or depeg rate in that state.
