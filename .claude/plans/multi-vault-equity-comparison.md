# Multi-vault equity curve comparison

## Goal

Add a vault chart page where a user can search for several vaults, add or
remove them from a comparison, and display their indexed equity curves on one
TradingView lightweight-charts time series. The page also offers independently
selectable US Treasury, ETH, and BTC benchmarks with fixed colours.

The comparison must remain meaningful when vaults started at different times:
the oldest selected vault begins at an index value of 100, and each younger
vault begins at the highest already-active equity curve value at its own first
observation. The page must not invent history before a vault's first real price
sample.

> Implementation note (2026-09-01): Later product decisions superseded parts
> of the original proposal below. The page heading is "Compare vaults", defaults
> to Savings USDS with T-Bill, ETH, and BTC enabled, offers 1M/3M/6M/1Y/Max
> ranges, and reuses `Search.svelte` directly through formatting props and an
> optional add-button snippet. An explicit `comparison=empty` query parameter
> distinguishes a user-cleared selection from the default state. Accepted
> search actions clear the input and close the suggestion panel.

## Product decisions and scope

- Add the page initially at `/vaults/compare` with the heading "Compare vaults"
  and include it in both vault chart navigation surfaces.
- Treat normal vaults, tokenised funds, and blacklisted vaults as valid URL
  selections, but exclude vaults below $1,000 current TVL from search results.
  Preserve the existing warning styling for eligible blacklisted search
  results. A selected record which has no parquet rows follows the same
  explicit "Equity history unavailable" path as any other vault.
- Keep selected vault IDs and enabled benchmarks in the query string so a
  comparison can be shared, refreshed, and restored through browser history.
  Preserve vault insertion order because it participates in alignment and
  legend order.
- Propose a visible limit of eight selected vaults. Keep this in one exported
  constant shared by the page, query parser, and data endpoint; the limit keeps
  the chart, crosshair tooltip, URL, DuckDB query, and distinct-colour palette
  bounded. If product wants another limit, change the constant and palette
  together rather than silently truncating selections.
- Start with Savings USDS and all three benchmarks selected unless the URL
  contains explicit comparison state. Show an explanatory empty state after a
  user removes all vaults; benchmarks need a selected vault's time range, so
  the chart cannot render them alone.
- Offer `1M`, `3M`, `6M`, `1Y`, and `Max` range controls and crosshair
  behaviour. This page is an indexed equity comparison only: do not add the
  detail page's TVL histogram, featured metrics, perpetual-vault classification,
  or drawdown pane.

## Current implementation to reuse

- `src/lib/top-vaults/VaultPriceChart.svelte` is the visual reference. It uses
  `ChartContainer`, lightweight-charts `Series`, a crosshair tooltip, range
  controls, and a footer legend, but it assumes exactly one vault and couples
  the price pane to TVL, drawdown, and automatic benchmark selection.
- `src/routes/vaults/[vault=vaultId]/metrics/+server.ts` reads hourly
  `share_price` data from `cleaned-vault-prices-1h.parquet`. Calling this route
  once per selection would open several DuckDB connections and scan the same
  parquet repeatedly, so the comparison needs a bounded batch endpoint.
- `CoinbaseBenchmarkSeries.svelte`, `coinbase.ts`,
  `TreasuryBenchmarkSeries.svelte`, and `treasury-benchmark.ts` already provide
  the BTC, ETH, and US 3-month T-bill data paths, caching, resampling, and
  benchmark metadata. Extract shared transformation pieces rather than adding
  new upstream integrations.
- `src/lib/search/components/Search.svelte` already implements debounced search,
  cancellation, keyboard selection, responsive presentation, and result
  rendering. It currently hard-codes navigation, the full mixed-entity index,
  a site-search form, and a single DOM listbox ID, so it cannot safely be placed
  on the comparison page unchanged.
- `searchVaultEntities()` already builds public vault records containing the
  internal `vaultId`, canonical detail link, logo, protocol, chain, APY, and
  TVL. Extend its options rather than loading the complete top-vaults export in
  the browser.

## Proposed architecture

### 1. Add canonical comparison state

Create a small browser-safe module such as
`src/lib/top-vaults/equity-comparison/state.ts` containing:

- `MAX_SELECTED_VAULTS` and the benchmark keys `treasury`, `eth`, and `btc`;
- a typed `EquityComparisonState` with ordered, unique vault IDs and a set/list
  of enabled benchmark keys;
- parsing and serialising helpers using repeated parameters
  (`vault=<encoded ID>&vault=<encoded ID>` and
  `benchmark=treasury&benchmark=btc`), avoiding assumptions about characters
  allowed inside a vault ID;
- canonicalisation that trims values, removes duplicates while retaining the
  first occurrence, rejects unknown benchmark keys, and enforces the visible
  selection limit.

Use this module from the page loader, client interactions, and chart-data
endpoint. Make canonicalisation idempotent: serialising already-canonical state
must produce byte-identical ordered parameters. The server loader should
compare only the raw repeated `vault` values to the resolved canonical vault
list and perform at most one 307 redirect, preserving unrelated parameters,
when duplicates, unknown IDs, or over-limit values are present. Canonicalise
the fixed benchmark list client-side with one guarded `replaceState` only when
the serialised value differs, preventing redirect/effect loops.

Query changes should use SvelteKit `goto` with `replaceState: true`,
`noScroll: true`, and `keepFocus: true`; do not make every checkbox click a new
browser-history entry. The server load should resolve selected-vault metadata
from `vault` parameters. It may inspect whether a `benchmark` parameter exists
only while deciding whether an otherwise empty URL represents an explicit
state; when vaults are selected, short-circuit before that access so
benchmark-only changes reuse the existing page data. Add an integration
assertion that a benchmark-only URL update does not request fresh selected-vault
metadata.

Add `src/routes/vaults/compare/+page.server.ts` to resolve selected IDs against
`getCachedTopVaults(fetch)`. Return a compact projection for the selected cards
and only the selected full vault rows plus their referenced curators for the
shared comparison table. Unknown or stale IDs should be removed through the
single canonical redirect, not cause a 500. Do not embed the complete vault
export or any price history in the HTML.

### 2. Refactor search into a reusable typeahead

Refactor the search code without changing the existing header or `/search`
page behaviour:

- Extend `SearchOptions` in `src/lib/search/vault-search.server.ts` with an
  allowed entity-type filter. Apply it before ranking/limiting so group results
  cannot displace vault matches.
- Add a small validated `scope=all|vaults` parameter to
  `/search/suggestions`; keep `all` as the default and map `vaults` to
  `vault`, `tokenised-fund`, and `blacklisted-vault`. Avoid accepting arbitrary
  unbounded type strings that fragment the public cache.
- Keep the common combobox behaviour and result row in `Search.svelte`, which
  owns query debouncing, aborting stale requests, loading/error/empty states,
  arrow-key navigation, Enter/Escape handling, and WAI-ARIA wiring.
- Generate per-instance input, listbox, and option IDs with `$props.id()` so the
  header search and page picker can coexist without duplicate IDs.
- Add page-formatting props and an optional `addButton` snippet to
  `Search.svelte`. The comparison page requests `scope=vaults`, supplies its Add
  action, marks selected results as disabled, and explains when the selection
  limit is reached. Clicking or pressing Enter on a result invokes that action
  rather than navigating, then clears the query and closes the result panel.

Keep result metrics, logos, protocol/chain context, address matching, and
blacklisted styling shared. Do not duplicate the server-side search index or
fetch the full vault catalogue for a client-side picker.

### 3. Add a batched price-series endpoint

Add `src/routes/vaults/compare/chart-data/+server.ts` and move the common
DuckDB/parquet query code out of the single-vault metrics route into a
server-only helper such as `src/lib/server/top-vaults/vault-price-series.ts`.

The comparison endpoint should:

- parse the canonical ordered vault IDs and reject an empty, malformed, or
  over-limit request with a typed 400;
- resolve IDs against the current cached top-vault dataset before querying, so
  stale IDs can be returned explicitly and arbitrary values do not expand the
  SQL shape;
- open one DuckDB connection and use parameterised placeholders in one ordered
  `WHERE id IN (...)` query for `timestamp` and `share_price`;
- order by vault ID and timestamp, discard non-finite/non-positive samples, and
  return a typed array of `{ id, points }` plus any requested IDs with no price
  history;
- regroup the SQL rows and explicitly project the response back into the
  caller's requested-ID order; SQL ordering exists for efficient grouping and
  is not the public series-order contract;
- always close the connection in `finally`, retain the existing parquet refresh
  behaviour, and use a bounded response/cache policy consistent with how often
  the hourly parquet can update.

Refactor `/vaults/[vault=vaultId]/metrics` to call the same helper while keeping
its existing `{ price, tvl, utilisation }` response contract. The helper may
accept a column selection so the comparison route does not read or serialise
TVL/utilisation. This prevents the new page and detail page queries from
drifting without breaking existing consumers.

On the client, issue one comparison request for the current ordered selection.
Abort or ignore stale responses after selections change. Keep previously
rendered curves visible during a refresh, show a non-destructive loading state,
and provide retry when the batch fails. A vault with no history remains in the
selected list with an "Equity history unavailable" status and is omitted from
the plotted series.

### 4. Define and test the equity alignment algorithm

Create pure functions in
`src/lib/top-vaults/equity-comparison/equity-curves.ts`; keep alignment out of
the Svelte component so its financial behaviour can be tested directly.

Prepare the series as follows:

1. Sort and de-duplicate each vault's valid samples by timestamp.
2. Sort vault series by their first timestamp, using selected-list order only as
   the deterministic tie-breaker.
3. Group vaults with the same first timestamp so their alignment cannot depend
   on processing order inside that cohort.
4. Set every member of the oldest cohort to an equity index of 100 at its first
   sample: `indexed = rawPrice / firstRawPrice * 100`.
5. For each younger cohort, inspect every already-aligned older series whose
   observed range covers the younger cohort's first timestamp. Use that older
   series' most recent real/resampled value at or before the timestamp and take
   the maximum as the cohort anchor.
6. Scale each younger series from its own first valid price:
   `indexed = rawPrice / firstRawPrice * anchor`. Never emit points before its
   first observation.
7. If no older curve overlaps the younger start, fall back to 100 and attach a
   discontinuity flag for the tooltip/legend; do not indefinitely forward-fill
   a finished vault merely to manufacture an anchor.

Run this alignment over the complete selected histories before applying the
visible window. Changing the range must only clip/resample the result, not
change a vault's anchor or recolour the series. Recompute all anchors when a
vault is added or removed because that can legitimately change which older
curve supplies a younger vault's highest starting point.

Each plotted point should contain only its timestamp and indexed value;
alignment status belongs to the series. Label the Y-axis and tooltips as an
equity index rather than a token price; share prices from different
denominations must never be compared directly.

### 5. Build the multi-series chart and benchmarks

Add a focused component such as
`src/lib/top-vaults/equity-comparison/VaultEquityComparisonChart.svelte` using
the same `ChartContainer`, `Series`, time-span, formatting, and tooltip
primitives as the current vault detail chart.

- Render every aligned vault as a two-pixel line on the primary pane. Do not use
  the detail chart's direction-driven bullish/bearish colour, which would make
  multiple vaults indistinguishable.
- Define an accessible vault colour palette that deliberately avoids the three
  fixed benchmark colours. Assign the first unused palette entry when a vault
  is added, retain existing assignments when another vault is removed, and
  rebuild deterministically from URL order on a fresh load.
- Put the colour constants in one module and reuse them for chart lines,
  selected-vault rows, checkboxes, legend swatches, and tooltip markers.
- Keep the established benchmark colours unless design review changes them:
  US Treasury `#4a90d9a0`, BTC `#f7931a80`, and ETH `#627eea80`. Benchmark
  colours never depend on price direction or selection order.
- Start enabled benchmarks at index 100 on the oldest selected vault's first
  observation. Fetch all enabled benchmarks over the complete comparison date
  range, transform BTC/ETH closes into indexed cumulative returns, and use
  `ratesToCumulativeReturn()` for Treasury compounding. Then clip them with the
  same visible range as vault curves.
- Treat the comparison start/end as part of each benchmark request/cache key.
  Adding or removing the oldest/most-recent vault can expand or contract that
  range, so abort the obsolete request, refetch or reuse the correctly keyed
  data, and re-index the benchmark from the new global start before applying
  it. Never retain a benchmark anchored to the previous selection range.
- Extract/reuse a pure price-index transformation from
  `CoinbaseBenchmarkSeries.svelte`; adapt the existing benchmark components or
  add a generic indexed benchmark series rather than duplicating fetch/cache
  logic. The vault detail chart must retain its current visible-range rebasing
  behaviour.
- Load each enabled benchmark independently. A FRED or Coinbase failure should
  mark only that checkbox/legend entry unavailable and leave all vaults and
  other benchmarks usable. Disabling a benchmark removes its series and
  ignores any late request result.
- Use a compact, single-column crosshair tooltip with date plus one marked row
  per available vault/benchmark. Keep names truncated with accessible full
  labels so the tooltip stays readable and not overly wide, including on small
  viewports.

### 6. Compose the page and navigation

Create `src/routes/vaults/compare/+page.svelte` with the repository's page
comment and existing chart-page shell:

- metadata/JSON-LD, `VaultListingsSelector`, a concise `HeroBanner`, chart
  section, and `ScatterPlotSelector`;
- the inline vault picker;
- a selected-vault list with colour swatch, name, protocol/chain context,
  canonical detail link, data status, and an explicitly labelled Remove button;
- a `fieldset` of three independent fixed-colour benchmark checkboxes; and
- chart loading, empty, partial-data, error, and retry states that do not shift
  or erase the selection controls.

Use responsive wrapping/stacking and the existing semantic theme tokens. Avoid
hard-coded surface/text colours outside the deliberately fixed series palette.
Ensure all controls are keyboard reachable, checkbox state is announced, focus
returns sensibly after removing a row, and the search input remains focused
until an Add action is accepted. Adding a vault clears the query and closes the
suggestion panel.

Add the page link to both:

- `src/lib/top-vaults/VaultListingsSelector.svelte` (`chartLinks`); and
- `src/lib/scatter-plot/ScatterPlotSelector.svelte` (`charts`).

Update chart navigation integration assertions and `docs/chart-pages.md` so the
new route, lightweight-charts choice, and data flow are discoverable.

## Verification

### Unit and component tests

- State parser/serialiser round trips, duplicate removal, order preservation,
  invalid benchmark removal, unknown vault handling, and selection-limit
  enforcement.
- Equity alignment with one vault; differently dated vaults; same-start
  cohorts; a younger vault anchored to the highest overlapping curve; sparse
  timestamps; non-positive/invalid points; non-overlapping histories; and
  removal-triggered realignment.
- Range changes clip already-aligned data without changing anchors.
- Benchmark indexing starts at 100 on the global comparison start, and the
  three fixed colours never collide with the vault palette. Adding an older
  vault widens the benchmark request range and re-indexes the enabled benchmark
  from the new start.
- Batch helper returns each requested series in request order, parameterises
  IDs, reports missing histories, filters bad prices, and closes DuckDB on both
  success and failure.
- Search type filtering occurs before result limiting, while the default
  site-wide results and diversified ranking remain unchanged.
- Reusable search component preserves debounce/cancellation, unique ARIA IDs,
  keyboard selection, site navigation mode, add mode, selected-result disabling,
  query clearing, and limit messaging.

### Integration tests

Add a focused Playwright fixture/spec for `/vaults/compare` that verifies:

- the empty state and all three benchmark checkboxes;
- searching returns vault entities only and selecting one adds it without
  navigating away;
- multiple vaults produce distinct line/legend colours and one batched chart
  request;
- a younger fixture starts at the highest older curve value at that timestamp
  and has no points before its own history begins;
- removing a vault updates the URL, list, legend, and aligned chart while
  preserving the remaining controls;
- Treasury, ETH, and BTC can be toggled independently and use their fixed
  colours;
- refresh and back/forward navigation restore canonical selected state;
- missing vault history and one failed benchmark show partial failure states
  without clearing successful curves; and
- mobile/tablet layouts keep the picker, remove controls, legend, and tooltip
  readable.

Update existing search integration tests to prove the header search still
navigates across every entity type and update chart menu/selector link counts.
Keep the two data layers deterministic without depending on live/private R2
data:

- helper/endpoint Vitest coverage creates a temporary parquet with DuckDB and
  passes its explicit local path through the shared helper's injectable
  `parquetFile`/resolver option; and
- Playwright fulfils the client-side batch chart-data request with known
  multi-vault JSON containing deliberately staggered starts, while separate
  route tests cover validation and response shaping.

Do not write the test parquet to the application's normal `data/` cache or rely
on `TS_PRIVATE_VAULT_PRICES_PARQUET_URL`, as either can leak state between
integration workers.

Run focused tests first, then:

```shell
pnpm run format
pnpm run check
pnpm run test:unit --run
pnpm run test:integration
```

For manual verification, follow `.claude/docs/worktree.md`, start the Vite
development server with `pnpm run dev`, and use Playwright against
`http://127.0.0.1:5173/vaults/compare`. Do not use Vite preview for manual
route validation.

## Implementation sequence

1. Add canonical comparison state and pure equity-index/alignment functions
   with unit tests.
2. Extract the shared server-side parquet query and add the bounded batch
   chart-data endpoint without changing the detail metrics response.
3. Add search scope filtering, extract the reusable typeahead/result row, and
   preserve the header search through component and integration tests.
4. Build the inline vault picker and selected-vault/benchmark controls with URL
   state.
5. Build the multi-series chart, colour registry, benchmark transformations,
   tooltip, and partial-failure handling.
6. Compose the route, metadata, responsive states, and both navigation links.
7. Add multi-vault integration fixtures/tests, update documentation and the
   dated `CHANGELOG.md` entry required for a feature PR, format, and run the
   full verification commands. Confirm `/vaults/compare` wins over the
   dynamic vault-detail matcher in both Vite development and the adapter-node
   production build.

## Acceptance criteria

- A user can search for, add, and remove vaults without leaving the comparison
  page; already-selected results cannot be added twice.
- Selected vaults are shown together as indexed equity curves with distinct,
  stable colours, and the selection is recoverable from the URL.
- The oldest vault starts at 100. Every younger overlapping vault starts at the
  highest older equity value available at its first observation, with no
  invented pre-start data; non-overlap fallback is explicit.
- US Treasury, ETH, and BTC are independent checkboxes and always use their
  fixed colours in the control, chart, legend, and tooltip.
- Price history is loaded through one bounded, parameterised DuckDB query per
  selection change rather than one parquet scan per vault.
- The shared search endpoint filters to vault entities before limiting results,
  while existing site-wide search behaviour and accessibility remain intact.
- Stale requests, missing price history, or a failed benchmark cannot overwrite
  newer state or remove successful curves.
- The page is present in both chart navigation surfaces, works at desktop and
  mobile sizes, and has focused unit and Playwright coverage using deterministic
  local fixtures.
