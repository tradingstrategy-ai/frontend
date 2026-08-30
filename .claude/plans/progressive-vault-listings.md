# Progressive vault listings

> Implementation note: the final initial listing size is 125 rows. References to 150 rows later in this document describe the original design target; current behaviour is documented in `docs/vault-listings.md`.

## Implementation status (2026-07-31)

Implemented the first delivery of this plan:

- first 125 rows are filtered, sorted, and rendered by the page server load;
- later rows are fetched in 50-row pages from `/top-vaults/listing-data`;
- loaders, continuations, and the table use the same browser-safe query and
  sorting modules;
- complete-listing counts and aggregates are sent separately from the row
  prefix, so page metadata and overview text do not understate long lists.

The application reads the current export directly from R2. The earlier
snapshot-retention, cross-instance grace cache, and opaque-cursor proposals
below are intentionally not implemented: a continuation detects an export
version change via `generated_at`, returns `409`, and the client reloads the
server-rendered first page. This keeps the mechanism consistent with the R2
data-source contract.

## Goal

Make every long vault table render the first 150 matching rows as part of the
SvelteKit page load, then download later rows progressively as the user scrolls.
Server-side page loads and client-side continuation requests must use the same
pure filtering and sorting implementation so they always agree on row order,
including provider-specific or specialist rankings such as CORE3 and Xerberus.

The first page must not trigger a hydration-time request for the complete vault
export. The legacy `/top-vaults/all-data` endpoint was retained during this
listing migration and removed after its remaining consumers were migrated.

## Current behaviour and constraints

- `TopVaultsTable.svelte` owns the filter schema, comparator registry, local
  filtering, local sorting, summary calculations, and the 150/50 row rendering
  limits.
- `fetchAllVaultData()` always downloads `/top-vaults/all-data`; current
  "infinite scroll" only reveals more rows from that already-downloaded array.
- The in-progress inline-data change caps the server payload at 150 raw records,
  but those records are sliced before the table applies its filters and sort.
  It therefore does not guarantee the first 150 visible rows and still refreshes
  the complete export after hydration.
- Listing scopes and defaults differ: all/top, chain, protocol, stablecoin,
  curator, tokenised funds, international, high-TVL, new, negative, and
  blacklisted listings do not all use the same predicates or default sort.
- Counts, TVL, weighted return, hidden-by-TVL details, page descriptions, and
  JSON-LD currently assume the complete filtered array is present in the
  browser. Progressive rows must not make these summaries describe only the
  downloaded prefix.
- The current worktree contains CORE3 data and ordering, but no Xerberus route,
  schema field, or comparator. The design must expose a typed specialist
  ordering extension point and add parity fixtures for CORE3 now; wire Xerberus
  through that extension when its actual field and listing definition are
  present rather than guessing its data contract.

## Proposed architecture

### 1. Extract a shared listing query module

Create framework-independent modules under `src/lib/top-vaults/listing/`:

- `types.ts`
  - `VaultListingScope`: a discriminated union for `all`, `chain`, `protocol`,
    `stablecoin`, `curator`, `tokenised-funds`, `international`, and specialist
    scopes.
  - `VaultListingDefaults`: default TVL, age, risk, unknown-protocol,
    monthly-return, sort, direction, blacklisting, summary, and display rules.
  - `VaultListingQuery`: the validated, canonical filter/sort state.
  - `VaultListingSummary`: the full-result counts, aggregates, and
    hidden-by-TVL metadata.
  - `VaultListingPage`: the initial/page-zero result with `vaults`,
    `generatedAt`, effective `datasetVersion`, `queryFingerprint`, `nextCursor`,
    `hasMore`, and required `summary`.
  - `VaultListingContinuation`: the later-page result with only `vaults`,
    `generatedAt`, effective `datasetVersion`, `queryFingerprint`, `nextCursor`,
    and `hasMore`; it does not repeat `summary`.
  - `VaultListingRow`: a projected row containing only fields needed by table
    cells and row links, plus an explicit `canonicalRowKey` used for the
    deterministic tie-breaker, client deduplication, and keyed rendering. Do not
    serialise full export records into HTML/page data.
- `query-state.ts`
  - Move the vault table URL schema and canonicalisation out of the Svelte
    component.
  - Export one parser/serialiser used by page loaders, the continuation endpoint,
    and `TopVaultsTable`.
  - Reject or canonicalise unsupported sort keys, directions, filter indices,
    limits, cursors, and scope values in one place.
- `scopes.ts`
  - Define pure scope predicates for chain aliases, unknown protocols,
    denomination slugs, curators, flags, blacklisting, and static special lists.
  - Accept already-resolved, serialisable enrichment context; never fetch from
    a pure scope/query module.
- `sorting.ts`
  - Move the `TopVaultsTable` comparator registry and return-column comparators
    into plain TypeScript.
  - Express specialist orderings as typed registry entries/listing definitions,
    not route-local `toSorted()` calls. Add CORE3 ordering through this registry.
    Reserve a tested registration shape for Xerberus without inventing fields
    that are absent from this checkout.
  - Define null placement for both directions explicitly.
  - Add a final immutable tie-breaker to every ordering so pagination has a
    total, stable order. Resolve the canonical key from a verified vault ID,
    falling back to `chain_id + address`, then `vault_slug`; fail loudly in
    development/tests if a record cannot produce a key.
  - Export column keys, default direction, and specialist registry metadata for
    `TopVaultsTable` to render its controls. The browser imports this registry
    but does not re-sort a downloaded prefix; the server imports the same
    comparator definitions to order the complete match set.
- `filtering.ts`
  - Move blacklisting, TVL/chain overrides, age, risk, drawdown, monthly return,
    closed, unknown-protocol, and text-search filtering out of the component.
- `query.ts`
  - Compose scope, filtering, sorting, summary calculation, and pagination in
    this fixed order:
    1. capture whole-database count from the immutable dataset and attach the
       caller's already-resolved enrichment context;
    2. apply non-interactive scope predicates and capture whole-scope count;
    3. apply every canonical interactive filter except TVL;
    4. calculate hidden-by-TVL count/sample from that population using the
       active threshold, then apply the TVL filter to produce the final matches;
    5. calculate full matching count and aggregates;
    6. apply the deterministic sort;
    7. slice the requested page.

  - Export the same `queryVaultListing()` function to server page loaders,
    endpoint handlers, the migration adapter, and unit tests. It takes an
    already-resolved `VaultListingContext` argument and performs no I/O. Browser
    code should consume its output, not maintain a second sort implementation.

Keep formatting-only helpers and cell rendering in `TopVaultsTable.svelte`.
Avoid importing Svelte, `$app/*`, server-only environment modules, or browser
globals into the shared query modules.

Add a bounded in-process LRU for query results:

- Key by dataset/enrichment version plus canonical query fingerprint.
- Store the sorted canonical row-key array and immutable summary, not duplicate
  vault objects.
- Resolve continuation pages in O(limit) by slicing the cached key array and
  looking each key up in the dataset snapshot's canonical-key index.
- Treat the LRU strictly as a latency optimisation. The query pipeline is
  deterministic for an effective dataset version and canonical fingerprint. On
  an LRU miss caused by eviction, process restart, or a request reaching another
  application instance, recompute the sorted keys and summary from that version
  and repopulate the local cache whenever the instance can still materialise it.
- Bound both entry count and total key count; cap and validate free-text search
  length so arbitrary searches cannot grow memory without limit.
- Retain every dataset version observed by the process for at least a
  1,800-second user dwell allowance. Derive the retained-version count from the
  measured export refresh cadence rather than assuming that current plus
  previous is sufficient. If the resulting memory budget is unacceptable,
  shorten the dwell allowance and preserve the typed recovery path below.

Add a separate bounded dataset snapshot store, shared by page loads and the
continuation endpoint:

- Retain the full top-vault export records for every version that falls within
  the configured 1,800-second-or-greater local grace window; this is distinct
  from the sorted-key LRU. Bound the store using the measured refresh cadence
  and memory cost, while always satisfying the dwell-time constraint.
- Build one `Map<canonicalRowKey, VaultInfo>` when a version enters the snapshot
  store. Retain and evict that index atomically with its export so projected
  continuation rows can be resolved in O(limit), and include its memory in the
  per-version budget.
- Pin the corresponding stablecoin metadata and FX enrichment snapshot/version
  alongside each retained export so international membership and ordering can
  be reproduced exactly.
- A query-LRU miss recomputes only when this snapshot store can materialise the
  cursor's effective version. The current upstream is a single mutable R2 key
  (or direct latest-only URL), not a version-addressable archive. On another
  application instance or after restart, fetch the latest upstream export and
  rebuild only if its effective version matches the cursor. Otherwise return
  the typed conflict and use the client recovery flow; do not claim
  cross-instance grace that the current storage contract cannot provide.
- Bound retained versions, lifetime, and memory explicitly and measure the
  actual multi-version cost implied by the refresh cadence.

### 2. Define reusable listing configurations

Create browser-safe `definitions.ts` as the authoritative pure route/listing
registry. Each definition supplies:

- a stable public listing key;
- scope kind and validated scope value requirements;
- default filters, sort key, and direction;
- inclusion/blacklisting/unknown-protocol rules;
- summary rules such as the blacklisted TVL outlier cap;
- any specialist sort registry entries;
- an optional enrichment key, but never an asynchronous resolver or server-only
  import.

Create a separate server-only resolver registry at
`src/lib/server/top-vaults/listing-resolvers.ts`, keyed by the definition's
enrichment key. Page loaders and the continuation endpoint resolve international
stablecoin/FX metadata there and pass a serialisable `VaultListingContext` into
the pure query pipeline. The client-side migration adapter receives that safe
context as an injected prop alongside its full array; it never imports or calls
the server resolver. Add an import-boundary/build test proving
`definitions.ts`, comparators, filters, and `queryVaultListing()` remain safe in
the browser bundle.

Map the current pages to definitions:

| Pages                           | Definition considerations                                   |
| ------------------------------- | ----------------------------------------------------------- |
| `/vaults`, `/vaults/all`        | Same source scope; different blacklisting/default TVL rules |
| `/vaults/high-tvl`              | `$2M` default TVL                                           |
| `/vaults/new-vaults`            | Young-vault default age                                     |
| `/vaults/negative`              | Negative monthly return and ascending return default        |
| `/vaults/blacklisted`           | Blacklisted-only scope, TVL descending, special summary cap |
| Chain details                   | All chain IDs represented by a shared slug                  |
| Protocol details                | Exact protocol or unknown-protocol group                    |
| Stablecoin details              | Exact resolved denomination slug                            |
| Curator details                 | Exact curator slug, TVL default sort                        |
| Tokenised funds                 | `tokenised_fund` flag and fund-specific aggregates          |
| International                   | Stablecoin metadata/rate enrichment before filtering        |
| CORE3/Xerberus specialist lists | Typed specialist comparator and eligibility rules           |

Page components pass a definition key and scope value rather than rebuilding
predicates. Invalid dynamic scopes remain 404s in their page loaders.
Definition scope predicates are mandatory and non-overridable. Interactive URL
filters may only narrow a definition's scope; they cannot turn a blacklisted,
negative, provider-specific, or dynamic detail listing into another population.

### 3. Use versioned cursor pagination

Add a GET endpoint such as `/top-vaults/listing-data` that accepts:

- listing key and validated scope value;
- canonical filter/sort query;
- opaque cursor;
- a bounded limit (50 for scroll continuation; permit 150 only for the initial
  server query if the endpoint is reused there).

The cursor should encode the effective dataset version, canonical query
fingerprint, and next offset. Offset is sufficient because the cached export is
immutable for a given version. Parse the opaque payload with a typed schema;
require a non-negative integer offset, clamp it to the matching result length,
and reject malformed cursors with a typed 400. Signing is unnecessary because
offset is not an authority boundary.

The effective dataset version includes `topVaults.generated_at` and the version
or timestamp of any enrichment source that can change membership, values, or
order (notably stablecoin metadata and FX rates for international listings).

Compute the fingerprint from the fully canonical `VaultListingQuery` after
definition defaults and aliases are resolved, plus listing key, validated scope
value, and effective enrichment version. Never fingerprint raw URL parameters.

Serve continuation pages from any retained version while it remains
materialisable through the bounded grace cache. A missing query-fingerprint LRU
entry is recomputed and is not a conflict. Return HTTP 409 only when the
cursor's effective dataset/enrichment version itself can no longer be produced;
mark conflict responses `Cache-Control: no-store`. The client then invalidates
the current page and replaces its rows with a fresh first page instead of
appending duplicates or gaps.

The initial SSR/page-zero result includes:

- current `generatedAt`;
- full matching count, whole-scope count, and whole-database count;
- hidden-by-TVL count and the small tooltip sample;
- full matching TVL and TVL-weighted return;
- next cursor and `hasMore`;
- exactly the requested rows.

Continuation responses use `VaultListingContinuation` and contain only
projected rows, next cursor, `hasMore`, dataset version, and query fingerprint.
Counts and aggregates are invariant for a version/fingerprint and must not be
repeated on every 50-row response.

Use dataset version plus canonical listing/query/cursor only as the in-process
query-LRU key. Every HTTP response remains `private, no-store` as specified in
section 7. Carry over only the diagnostic generated-at/source/cache-age headers
from the existing full-data endpoint.

### 4. Render the initial 150 through page load

For every vault table page:

- Read `url.searchParams` in `+page.server.ts` using the shared query parser.
- Resolve its listing definition and scope.
- Call `getCachedTopVaults(fetch)`, resolve any server-only enrichment into a
  serialisable `VaultListingContext`, and call
  `queryVaultListing(..., context, limit: 150)`.
- Return the resulting 150 matching, already-sorted rows plus the cursor and
  full-result summaries in page data.
- Use those totals for JSON-LD, status text, descriptions, fund totals, and
  curator/protocol summaries where applicable.

Replace the current raw `getInlineVaultListing(...).slice(0, 150)` approach.
Short results naturally have `hasMore: false`; long results have exactly the
first 150 matching rows and a continuation cursor.

Changing search, filters, or sort continues to update the URL. Because the
server load reads the URL, SvelteKit reruns it and returns a new embedded first
page. Do not issue a duplicate client fetch for page zero after navigation or
hydration.

Interaction requirements for these server round trips:

- Keep the existing trailing 300 ms search debounce.
- Use `goto(..., { replaceState: true, noScroll: true, keepFocus: true })`.
- Show a non-destructive pending state on filter controls and sortable headers
  while SvelteKit loads the replacement page.
- Cancel superseded navigation/fetch work where supported and always compare the
  returned fingerprint at apply time before replacing or appending rows.
- Disable only the control action currently in flight; keep already-rendered
  rows readable during the transition.

### 5. Make `TopVaultsTable` a paginated result consumer

Refactor the table to accept:

- the current canonical query/defaults;
- the initial/query-replacement `VaultListingPage`;
- a reusable `loadNextPage(cursor): Promise<VaultListingContinuation>` callback
  or listing request descriptor.

Behaviour:

- Render the page-load rows directly; remove local re-filtering and re-sorting.
- Display server-computed full-result summaries, not aggregates over loaded rows.
- On sentinel entry, request the next 50 rows once, append them, and advance the
  cursor.
- Deduplicate and key rendered rows by `canonicalRowKey` defensively.
- Track the query fingerprint and dataset version. Replace local accumulated
  rows whenever either changes.
- Abort or ignore stale in-flight requests after a query/navigation change.
- Expose a retry state for continuation failures without discarding existing
  rows.
- If a version conflict occurs, invalidate/reload the current page query and
  start again from its server-rendered first 150.
- Keep the sentinel accessible and distinguish “loading more”, “retry”, and
  “all rows loaded”.
- Add a temporary full-array compatibility adapter that wraps existing callers
  behind the shared query contract. For each client-side query change it calls
  the same framework-independent `queryVaultListing()` pipeline over the
  wrapped full array and synthesises a `VaultListingPage`, including canonical
  filtering, sorting, full-result summaries, fingerprint, and a local cursor.
  It must preserve today's initial 150-row cap, return `hasMore: true` while
  local rows remain, and supply local 50-row `loadNextPage` slices; it must never
  render the entire wrapped array at once. Its injected inputs include the
  already-resolved, serialisable listing context required by the definition.
  This keeps every unmigrated route's controls, ordering, and summaries correct
  while routes migrate one by one. Remove the adapter after the final listing
  route is converted. During the staged migration only, routes still behind
  this adapter continue downloading their full arrays; the final
  no-full-dataset acceptance criterion applies after step 8 removes the
  adapter.
- Keep paginated state in a reusable controller/store owned by each
  `+page.svelte` and passed into `TopVaultsTable`. The controller exposes bounded
  `capture()`/`restore()` methods.
- Each migrated `+page.svelte` (the SvelteKit boundary that supports snapshots)
  exports `snapshot.capture`/`snapshot.restore` and delegates to that controller;
  do not attempt to export a SvelteKit snapshot from `TopVaultsTable.svelte`.
- Bound session-storage usage by retaining at most two pages/300 projected rows
  plus cursor, fingerprint, and version. Restore only when version and
  fingerprint match. For deeper histories or mismatches, discard the snapshot,
  use the fresh SSR page, and explicitly reset the restored scroll position.

Remove `maxVisibleRows`, `visibleVaults`, and the assumption that
`sortedVaults.length` is the full result. The number of rendered rows is simply
the number downloaded.

### 6. Migrate page consumers without breaking full-data features

- Replace `fetchAllVaultData()` in every `TopVaultsPage`/`TopVaultsTable`
  listing route with page-load data plus continuation requests.
- Keep `client-cache.ts` and `/top-vaults/all-data` temporarily while audited
  consumers are migrated; both were removed in the later server-data cleanup.
- Do not migrate chart-data endpoints to pagination; they already compute
  purpose-built aggregate payloads server-side.
- Ensure detail-page metadata maps (`curators`, `core3_protocols`) are not sent
  wholesale with every listing page. Return only metadata required by the page
  header/rows, or keep it in separately typed page fields.
- Preserve route-specific 404/redirect behaviour and mini-chart endpoints.
- Project every page/endpoint row through the shared `VaultListingRow` mapper so
  SSR and continuation payloads have the same schema and byte cost.

### 7. Make dynamic rendering and HTTP caching explicit

The current checkout has no `prerender = true` declaration under `src/routes`,
so query-dependent server rendering is compatible with the present route tree.
These listing pages become dynamic SSR by design. Before migration, recheck
route/ancestor configuration and add a build regression test so a future
`prerender = true` does not silently conflict with `url.searchParams`.

The current `svelte.config.js` enables SvelteKit CSP and dynamic documents can
carry nonces. Global hooks also vary rendered HTML by colour-mode/admin/
announcement cookies and Cloudflare `CF-IPCountry`. Therefore both listing
documents and SvelteKit page-data responses must use `private, no-store`; do not
put them in a shared cache without first replacing nonce mode and enumerating
correct `Vary` semantics for every request-dependent hook.

Set all continuation, malformed, and conflict endpoint responses to
`private, no-store`. Global hooks also run for `+server.ts` endpoints; avoiding
shared caching prevents cookie- or country-dependent handling from crossing
users. The bounded in-process query LRU remains the continuation performance
layer.

Canonicalisation must redirect or replace equivalent query spellings so
defaults do not fragment browser history or query-LRU keys. Recalculate the
local dataset snapshot lifetime and retained-version count whenever the
configured 1,800-second dwell allowance or measured export refresh cadence
changes.

### 8. Verification

Record the control-option audit before implementation. In the current
`TopVaultsTable.svelte`, TVL, age, risk, drawdown, monthly return, return-column,
sort-direction, and sort-column choices come from static helper/registry
definitions; there are no chain, protocol, denomination, or curator selectors
or per-option counts derived from `topVaults.vaults`. Therefore the initial
contract needs no option-facet metadata today. Add a regression test that these
control definitions remain independent of the downloaded prefix. If a future
or concurrently discovered control derives options or counts from listing
rows, extend the full-result summary with explicit facet metadata and compute
and test it before pagination.

Unit tests for shared modules:

- every sort key, both directions, null values, and deterministic tie-breakers;
- return-column aliases and specialist CORE3 ordering;
- a synthetic specialist-key test proving the registry extension contract
  without naming or guessing a provider data shape that is absent from the tree;
- a test against the real cached export asserting every record produces a
  non-null, unique canonical row key, with a focused fixture for the fallback
  `chain_id + address` path;
- all scope predicates and route defaults;
- query parse/serialise canonical round trips;
- equivalent URL spellings/default omission produce the same canonical query
  fingerprint;
- filtering before sorting before pagination;
- hidden-by-TVL count/sample applies all active non-TVL filters and the active
  TVL threshold, then final matches apply that threshold exactly once;
- whole-database count is captured before scope predicates, whole-scope count
  after scope predicates but before interactive filters, and full matching
  count after every active filter;
- summary values calculated from the complete match set, not the page slice;
- property-driven query permutations (every sort key and direction plus
  representative filter combinations) prove that concatenating all 150/50
  pages equals one unpaginated shared result with no duplicates or gaps;
- cursor/query/version mismatch rejection;
- every locally retained export/enrichment snapshot reproduces identical rows,
  while a latest-only upstream version mismatch on a cold or different instance
  produces the typed conflict and recovery contract;
- an evicted query-LRU entry recomputes from an available dataset snapshot and
  repopulates rather than returning a conflict.

Server/route tests:

- initial HTML/page data contains no more than 150 matching rows;
- short listings are complete and have no next cursor;
- long listings return a cursor without embedding the full dataset;
- page loader and continuation endpoint return identical order for the same
  definition/query;
- dynamic chain/protocol/stablecoin/curator scopes cannot leak other scopes;
- response diagnostic and cache headers;
- listing document/page-data, bounded continuation, free-text continuation,
  malformed, and conflict responses receive the specified cache policy;
- continuation responses are never shared-cacheable, including when requests
  carry different `CF-IPCountry` values or admin/announcement/colour cookies;
- a cursor for any version retained inside one process remains materialisable
  through continuation after an export rollover;
- a cursor sent to a cold/different instance rebuilds when its version still
  equals the latest upstream export, and returns the typed conflict/reload path
  when the latest-only source has advanced;
- route/ancestor prerender audit and production build confirm query-dependent
  listing pages remain dynamic SSR;
- browser-bundle/build audit confirms pure definitions/query modules do not
  import the server-only enrichment resolver registry;
- generated-at rollover produces the expected typed conflict;
- `limit=10000` is clamped, malformed/tampered cursors return typed 400 rather
  than 500, unknown listing keys return 404, and non-overridable definition
  scopes cannot be widened through URL parameters.

Svelte/component tests:

- entering the sentinel fetches and appends one 50-row page;
- repeated observer events do not duplicate requests;
- an endpoint failure keeps existing rows and exposes retry;
- totals come from the injected full-result summary rather than loaded rows;
- late continuation responses compare their fingerprint at apply time and
  cannot append after a query replacement;
- the migration compatibility adapter renders 150 rows initially, reveals local
  50-row slices, reproduces canonical filter/sort changes and full-result
  summaries through the shared query pipeline, and never renders its complete
  wrapped array at once;
- static control option lists are identical when the adapter receives 150 rows
  or the complete wrapped array, guarding against accidental prefix-derived
  controls;
- canonical fallback keys drive deduplication and keyed rendering when vault IDs
  are absent.

Playwright integration coverage:

- `/vaults` shows server-rendered rows before client JavaScript completes;
- hydration does not request `/top-vaults/all-data` or duplicate page zero;
- scrolling loads later rows and preserves the shared order;
- sort/filter/search navigation replaces rows with a new SSR page rather than
  appending stale results;
- search remains focused, preserves scroll, uses the 300 ms trailing debounce,
  and indicates pending server work;
- matching SvelteKit snapshots restore progressive rows on back/forward
  navigation, while mismatched versions reset safely;
- page-owned snapshot delegation caps stored state at 300 projected rows and
  deeper histories reset rather than filling session storage;
- exercise TVL, risk, text search, return sort, TVL sort, and ascending sort;
- cover blacklisted, negative, chain, protocol, stablecoin, curator, funds, and
  international definitions;
- add CORE3 specialist order coverage and Xerberus coverage when that listing is
  present in the checkout;
- assert the initial document/request sequence does not download
  `/top-vaults/all-data`;
- assert JSON-LD, descriptions, counts, TVL, and average return use full
  server-computed match totals even though only 150 rows are embedded.

Performance checks:

- compare initial HTML/page-data bytes and server query duration before/after;
- confirm one 150-row initial payload and 50-row continuation payload sizes;
- define and enforce byte budgets for initial projected rows and continuation
  pages based on a recorded production-like fixture;
- confirm LRU hits make page 2 onward O(limit), measure the deterministic
  recompute-and-repopulate miss path, and record bounded-LRU memory and eviction
  behaviour under varied search queries and simulated cross-instance requests;
- record and cap the memory cost of retaining every raw export, canonical-key
  index, and enrichment snapshot required by the computed grace window;
- inspect tooltips on affected tables for readability as required by repository
  conventions.

Run focused unit and integration tests first, then:

```shell
pnpm run format
pnpm run check
pnpm run test:unit --run
pnpm run test:integration
```

Manually verify against the Vite development server, not Vite preview.

## Implementation sequence

1. Add shared types, query state, scope definitions, filtering, sorting, and
   deterministic pagination with unit tests.
2. Add the versioned listing endpoint, bounded query-result LRU, projected row
   mapper, and endpoint tests.
3. Add the full-array compatibility adapter to `TopVaultsTable`, then convert
   `/vaults` as the reference implementation; verify SSR,
   hydration, query changes, continuation, summaries, and network requests.
4. Convert the static special lists (`all`, high-TVL, new, negative,
   blacklisted).
5. Convert dynamic chain, protocol, stablecoin, and curator listings.
6. Convert tokenised funds and international listings, including their custom
   enrichment and aggregate summaries.
7. Add/verify specialist ordering through the registry (CORE3 now, Xerberus when
   its concrete schema/list is available).
8. Remove the compatibility adapter after the last table route migrates. Audit
   remaining `fetchAllVaultData()` callers and retain it only for all-dataset
   chart/analysis consumers.
9. Run focused tests, full checks, and a development-server Playwright pass;
   record payload/timing measurements.

## Acceptance criteria

- Initial page HTML/data contains at most 150 vault records and those records are
  the first 150 matches in the canonical full ordering.
- Initial and continuation payloads contain projected listing rows, remain
  within recorded byte budgets, and do not embed unused full-record metadata.
- No vault table downloads the complete vault dataset on initial load or
  hydration after the compatibility adapter is removed in step 8.
- Scrolling downloads only the next page and never duplicates or skips rows.
- Server page load, continuation endpoint, and any client-visible ordering use
  one modular filtering/sorting implementation.
- Sort/filter/search changes produce correct global results, not results limited
  to already-downloaded rows.
- Full-result counts and aggregates remain accurate before all rows are loaded.
- Specialist listing orders are deterministic and registered explicitly;
  CORE3 is covered now and Xerberus uses the same extension contract once its
  real schema is available.
- Search/filter/sort server navigation preserves focus and scroll, indicates
  pending work, and cannot apply stale results.
- Full-result JSON-LD, descriptions, counts, TVL, and return summaries remain
  accurate while only a prefix of rows is downloaded.
- Existing chart pages that need complete data continue to work through their
  purpose-built payloads or the retained full-data endpoint.
