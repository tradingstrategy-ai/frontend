# Vault listing pagination

## Comparing selected vaults

Public vault listing tables let visitors select up to eight vaults for comparison.
The selection is local to the current listing: it survives sorting, filtering,
and progressive loading, but resets when the listing category changes. A filter
can temporarily hide a selected vault; its selection remains in the count and
comparison until the filter is relaxed or it is removed on the comparison page.
Selecting one or more vaults reveals a persistent **Compare vaults** action at
the listing section's left edge in its own table row, immediately after the
last selected row. Its dedicated row sticks beneath the fixed table heading as
the table scrolls, without covering vault cells. It opens the comparison page
with the selected IDs in click order as repeated `vault` query parameters and
`period=3M`. The comparison page's embedded selected-vault table does not
render these controls.

Vault table pages render their first 125 matching rows in the SvelteKit server
load. This makes the initial listing visible without downloading the complete
vault export in the browser.

`listingSummary` marks a table as server-backed, while `initialHasMore` only
describes whether its initial rows have a continuation. A short listing can
therefore gain continuation pages later when hidden blacklisted rows are
revealed.

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

The Filters panel exposes the permissioned-vault control as **Private** inside
the **Hide vaults** group. It adds `private=1` to the URL and excludes every
vault with a `whitelisted` deposit status. This includes tokenised funds: they
are displayed as **Fund** in the table, but still require permission to
deposit. The label refers to the deposit restriction, not the table's status
text. It is not shown on the Whitelisted listing because every vault in that
listing is permissioned.

### AMM filter

The **AMM** checkbox in the **Hide vaults** group excludes records with the
`amm_pool_like` feature. These are AMM pools and AMM-like vaults with direct
exposure to underlying assets. It is enabled by default on all listings, except
protocol listings, where it is disabled so a protocol page includes all
of that protocol's pools by default. The default does not need a URL parameter;
unchecking the control adds `amm=0` to show AMM pools. `amm=1` makes the
default hiding explicit. The filter uses the exported feature classification,
not a protocol-name allowlist.

### Unknown protocol filter

The **Unknown protocols** checkbox in the **Hide vaults** group excludes vault records whose underlying protocol was not identified by the source dataset. It does not mean that a known protocol is unsupported. Broad vault listings enable the filter by default; unchecking it adds `unknown=0` to the URL. Protocol, stablecoin, curator, fund, permissioned-vault, and provider-rating listings explicitly include unidentified records where required by their scope; the protocol detail page omits the control because hiding its own unknown-protocol group would contradict the page's purpose.

Unknown-protocol classification is applied before sorting and pagination through the shared listing query. Consequently, changing the sort column—including **3M Sharpe**—cannot reintroduce unidentified records. The browser compatibility filter uses the same `isUnknownVaultProtocol()` predicate as the server query.

### Volatility filter

The **Volatility** control filters the annualised three-month volatility value.
`vol=5`, `vol=10`, `vol=25`, and `vol=50` apply strict upper bounds, so a vault
at exactly the selected percentage is excluded. Vaults without a volatility
measurement are also excluded when a bound is active. **Any** is the default
and leaves vaults with or without volatility data in the listing.

## Continuation API

`GET /top-vaults/listing-data` returns up to 50 rows. It accepts the normal
listing filter query parameters plus:

| Parameter      | Required         | Description                                                                                              |
| -------------- | ---------------- | -------------------------------------------------------------------------------------------------------- |
| `listing`      | No               | Listing key; defaults to `top`.                                                                          |
| `scope`        | Dynamic listings | Route-provided chain, protocol, stablecoin, or curator slug. Unknown values return no rows.              |
| `offset`       | No               | Non-negative number of rows already received; defaults to `0`.                                           |
| `version`      | No               | Initial page `generated_at` timestamp. A changed export produces `409`.                                  |
| `previousRisk` | Reveal requests  | Previous technical-risk filter index. With a broader target risk, only newly included rows are returned. |

A successful response contains `vaults`, `nextOffset`, `hasMore`,
`generatedAt`, and the complete-result listing summary. Responses use
`Cache-Control: private, no-store`. On `409`, the table refreshes the current
URL through client navigation to obtain a fresh server-rendered first batch.

Once all default rows are visible, a listing with hidden blacklisted vaults
shows a centred **Show X blacklisted vaults** control below the table. It changes
the displayed risk level to **Blacklisted**, retains the existing rows, and
fetches rows outside the previous risk range in pages of up to 50. The URL is
updated without a document reload. This also restores non-blacklisted risk
levels omitted by a narrower previous selection.

The legacy complete-export endpoint has been removed. Normal browser pages use
paginated listings, matched-record lookups, or purpose-built chart payloads.

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

By default, CORE3 and Xerberus rating pages use the same non-blacklisted rated
vault population for the table, overview statistics, and TVL pie chart. This
includes AMM-like vaults and vaults without recognised protocol metadata. A URL
text search narrows the table but not the provider-wide overview. CORE3 protocol
ratings are resolved into each bounded table row on the server; the complete
CORE3 protocol registry is not returned with the listing.

## Stablecoin safety notices

Stablecoin detail pages show a red notice when stablecoin metadata identifies a likely depeg. When a native peg rate is available, the notice shows the inverse rate as token units per one unit of the peg currency and its fetch time.

If metadata reports `rate_fetch_failed_reason: missing_coingecko_id`, the page instead shows a yellow notice explaining that a price feed is unavailable. It does not present a peg or depeg rate in that state.
