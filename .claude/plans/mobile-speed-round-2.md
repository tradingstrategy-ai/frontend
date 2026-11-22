# Mobile speed round 2 plan

Written 2026-11-22, after verifying PRs #1484–#1493 on production. Follows
`docs/google-webmasters.md` ("Mobile LCP — 2026-11-20") and `docs/speed.md`.
Reviewed with Codex (`gpt-6-astra`) on 2026-11-22; its findings are folded in and listed
under "Review log".

## Goal

Bring real-user phone LCP comfortably under 2.5 s and stop INP creeping up, without any
visible UI or copy change.

Real-user phone data (CrUX, 28 days to 2026-11-20, before #1492 could show):

| Metric | p75      | Note                                          |
| ------ | -------- | --------------------------------------------- |
| LCP    | 2,414 ms | 76 % good; 2,509 ms in the week of 2026-11-14 |
| TTFB   | 1,070 ms | Largest single part of LCP                    |
| RTT    | 257 ms   | Network, not ours                             |
| FCP    | 2,124 ms | About 1 s after first byte                    |
| INP    | 192 ms   | Was 147 ms in early October                   |

Targets, measured as described in "Measurement" below:

- Origin render of `/`, hub and vault pages: p95 under 300 ms once the process is warm,
  with no request waiting for a vault-data download or rebuild (see the scope of the
  guarantee in section 1–2).
- Lab (throttled phone, median of 5): FCP and LCP under 1.5 s on home, Morpho hub, a
  curator page and a vault page; TBT under 300 ms on the Morpho hub.
- Hub HTML under 400 KB uncompressed (now 680–750 KB).
- CrUX phone LCP p75 under 2.2 s and INP p75 under 170 ms four weeks after release.

## Findings this plan is based on

1. **Home page waits on an upstream download.** `src/routes/+page.server.ts` calls
   `fetchTopVaults()` directly: an R2 download plus a Zod parse of the full export on
   every origin render (1.0–2.0 s measured on a Cloudflare MISS; the HTML is not
   streamed, so nothing reaches the browser until it finishes). The same uncached call
   is in `src/routes/strategies/[strategy=yamlStrategy]/+layout.server.ts`,
   `src/routes/vaults/sitemap.xml/+server.ts` and `src/lib/strategies/page-cache.server.ts`.
2. **The shared caches expire cold.** `getCachedTopVaults` (`src/lib/top-vaults/cache.ts`),
   `getCachedCryptoVaults`, `fetchStablecoinMetadataIndex`, the chart payload caches
   (`routes/top-vaults/chart-data`, historical TVL, mini charts) and the vault search
   index are plain "expires at" caches. Once an hour the first visitor
   after expiry pays for the refresh. Only `swrCache` users serve stale.
3. **Only one cache is warmed in the background.** `scripts/server.js` runs a 20-minute
   timer that POSTs to `/_internal/cache/strategies/refresh` with a per-process bearer
   token (PR #1401). Nothing warms the vault data.
4. **Hub and vault HTML is not edge-cached** (`cf-cache-status: DYNAMIC`, no
   `Cache-Control`). Only `/`, blog, glossary and trading-view pages send one.
5. **Six small render-blocking stylesheets** (2–6 KB each compressed) plus 26–39 KB of
   inline CSS per page, and 100–130 JS chunk requests, most of them about 1 KB.
6. **Hub pages are heavy.** Morpho hub: 684 KB HTML = 264 KB hydration data (75 rows ×
   3.5 KB) + 271 KB row markup (76 rows × 3.5 KB) + 103 KB chrome (mobile nav 26 KB,
   header 23 KB, two footers 27 KB). Lab: 3.4 s main-thread work, 740 ms TBT; 172 KB of
   unused ECharts JS.
7. **PageSpeed Insights shows a white screen until about 2.4 s on vault pages** although
   everything has loaded by 0.6 s. Not reproducible on macOS (Chrome 157 and Playwright
   Chromium paint at 0.4 s). The cause is unknown. The first suspect was the `local()` fallback faces in
   `src/lib/components/css/font-fallbacks.css`, but Chromium's `local_font_face_source.cc`
   paints a visible fallback while a local lookup is pending, so that mechanism is
   unlikely. Simulated PSI LCP for one URL varied 0.9–4.2 s over three runs.

## Measurement (do this first, PR 0)

Single PSI runs are too noisy to decide anything, and the round 5 `inlineStyleThreshold`
A/B was rejected on a PSI number that may have been finding 7.

1. Add `scripts/perf-probe.mjs` (`pnpm run perf:probe`): Playwright, Moto G4 emulation,
   CDP throttling (4× CPU, 150 ms latency, 1.6 Mbit/s down), fresh context per run,
   5 runs per URL, prints median and range of TTFB, FCP, LCP (with element), TBT, DCL,
   HTML bytes and request count. TBT is counted from FCP to a fixed 8 s after
   navigation start, so deferred work cannot fall outside the window. (A prototype,
   `lcp-probe.cjs`, was used for this plan's numbers; it lives in the session scratchpad,
   not the repo, so rewrite it from this description.) Each run records the git
   revision and whether the origin and Cloudflare were warm. Flags: `--base <url>`, `--cpu`, `--no-network-throttle`,
   `--channel chrome`, `--runs`.
2. Fixed URL set: `/`, `/vaults`, `/vaults/protocols/morpho`, `/vaults/protocols/lighter`,
   `/vaults/curators/steakhouse-financial`, `/vaults/stablecoins/usdc`, one vault page,
   one glossary term.
3. A Linux run of the same probe, because PSI runs Linux Chrome: the stock
   `mcr.microsoft.com/playwright` Docker image (needs Docker Desktop running). Record
   whether the 2.4 s white screen reproduces there. If it does, capture a Chrome
   performance trace with `browser.startTracing()` / CDP `Tracing.start` (categories
   `loading,blink,devtools.timeline`; Playwright's `context.tracing` is not a Chrome
   trace) and name the blocker. A Linux container does not reproduce Android's font
   stack, so also run one real Android phone over USB remote debugging, or WebPageTest
   on a Moto G, before concluding anything about phones.
4. Interaction probe for INP: on the Morpho hub and `/vaults`, after hydration, measure
   the duration of a sort click, a filter change, opening the mobile menu, ticking a
   comparison checkbox and a continuation load (Event Timing `duration`, throttled CPU).
   For the field, add `web-vitals` attribution build reporting of INP target and
   long-animation-frame scripts to the existing analytics, sampled, to learn which
   interactions are slow for real users before optimising.
5. A/B method for build-level changes: build both variants, run each with
   `node --env-file=.env --env-file=.env.local scripts/server.js` behind a local
   HTTP/2 TLS proxy (Caddy `reverse_proxy` with `tls internal`), because plain
   adapter-node is HTTP/1.1 and did not reproduce production contention in round 5. This still lacks Cloudflare's
   cache state, Early Hints and mobile prioritisation, so the final check of every PR is
   the probe against production after release.
6. Record baseline numbers for the URL set in `docs/speed.md` before PR 1.

## 1–2. Background cache warmer (PR 1)

Principle: **in a warm process, no visitor request waits for a vault-data refresh.**
Caches serve what they have; a background job replaces the contents once an hour.

Scope of the guarantee, stated honestly:

- Covered: the top-vaults export and everything derived from it, crypto vaults,
  stablecoin metadata, hub chart payloads, search index.
- Also to be brought under the same helper in this PR, because they are awaited on
  page loads today: Ghost posts on the home page (`src/routes/+page.ts` →
  `$lib/blog/client`) and vault protocol metadata on vault pages
  (`src/routes/vaults/[vault=slug]/+page.server.ts` → `$lib/vault-protocol/client`,
  5 s timeout). Protocol metadata is keyed by protocol, a bounded set, so it is warmed;
  blog posts get serve-stale with a short refresh interval.
- Not covered: a cold process before its first warm completes, and keys that are not
  warmed (per-vault metrics, arbitrary query strings). Those still load on demand.
- The job runs **inside the serving process**: JSON parsing, Zod validation and
  serialisation of the export block its event loop. It removes the wait from a
  visitor's request but not the CPU stall. Measure it (below); if one refresh blocks
  the loop for more than about 200 ms, move the parse and validation to a
  `worker_threads` worker in this PR.

### Cache semantics

- Add a small helper next to `src/lib/swrCache.ts` (or extend it) that every shared
  server cache uses: `get()` returns the current value, awaiting a load only when there
  has never been one (cold process); `refresh(signal)` forces a reload, single-flight,
  and replaces the value only on success; `status()` reports age, source age
  (`generated_at` where the data has one), last refresh duration and last error.
- **Separate raw loaders from cached getters first.** Today failure is not uniform:
  `stablecoin-metadata/client.ts` returns `[]` on failure and
  `server/top-vaults/crypto-vaults.ts` returns old data while resetting its expiry. Each
  loader must report one of _success_, _unavailable_ (throw) — never an empty success —
  so the helper can keep the previous value. The helper's states are _fresh_, _stale
  (last refresh failed)_ and _never loaded_.
- Request-path fallback when the scheduler is broken: if a value is older than twice
  its refresh interval, `get()` starts a background `refresh()` and still returns the
  stale value, with exponential backoff (1, 2, 4 … 30 min) so a failing upstream is not
  retried on every request.
- Each cache declares a maximum acceptable source age (for example 6 h for the export).
  Beyond it the status is `degraded`, logged as an error and shown on `/diagnostics`;
  pages keep serving the stale data rather than failing.
- Keep deliberate shorter intervals: `getCachedStrategies` stays a 60-second `swrCache`
  and is not slowed to hourly; the reference rates keep two days. The warmer only
  guarantees an upper bound, it does not lengthen any TTL.
- Staleness budget to document: upstream export about hourly + up to 60 min in the
  process + 30 min at the edge for `/` (plus any stale-while-revalidate window).
- Convert to it: `top-vaults/cache.ts`, `server/top-vaults/crypto-vaults.ts`,
  `stablecoin-metadata/client.ts`, `routes/top-vaults/chart-data`, the historical TVL /
  CORE3 / heatmap / mini-chart endpoint caches, and the vault search index
  (`search/vault-search.server.ts`, currently rebuilt on a 2-minute TTL).
- Derived caches are rebuilt by the warmer right after their inputs, not lazily, and are
  versioned on **all** inputs: the search index depends on the export _and_ stablecoin
  metadata (`search/vault-search.server.ts`), so `generated_at` alone is not enough.
- Publishing a new export mid-session: `routes/top-vaults/listing-data` already answers
  409 when the version changed and the client reloads the listing. Add a test for a
  refresh landing between the first page and a continuation request.
- Memory: a refresh briefly holds the old and the new export plus compressed and
  uncompressed payloads. Record peak RSS and event-loop delay
  (`perf_hooks.monitorEventLoopDelay`) for one full warm in the PR, against the
  container's memory limit. Give every keyed cache (mini charts, protocol metadata) a
  maximum entry count with eviction; keys that leave the top-20 set must not accumulate.

### Callers

- `src/routes/+page.server.ts` and
  `strategies/[strategy=yamlStrategy]/+layout.server.ts` switch from `fetchTopVaults` to
  `getCachedTopVaults`. Keep the `debugFreshness` payload; add the top-vaults cache age.
- `vaults/sitemap.xml` switches too (it is crawled, not user-facing, but shares the pool).
- `strategies/page-cache.server.ts` keeps its direct fetch: it already runs in the
  background job, and can read the freshly warmed cache instead once the order below holds.

### Worker

Reuse the PR #1401 mechanism rather than adding a second process: adapter-node timer →
loopback POST with the per-process token → SvelteKit endpoint (so `$lib` code, env and
`event.fetch` for relative URLs all work).

- `src/lib/server/cache-warmer.ts`: an ordered registry of named tasks, each
  `{ name, run(fetch, signal), timeoutMs }`. Tasks run **sequentially** — the 2026-11-19
  outage was a full libuv thread pool, and `data-limits.ts` allows only 4 DuckDB
  queries — and one failing task does not stop the rest.
- Sequential start is not bounded concurrency by itself: a timed-out task can keep
  running (`data-limits.ts` documents that an interrupted query frees its slot only when
  it has really stopped), and `page-cache.server.ts` fans out in parallel internally.
  Therefore: every task receives an `AbortSignal` that is passed down to `fetch`, the
  R2 client and `withDuckDbConnection`; the warmer's lock is released only when the
  task's underlying promise has settled, not when its timeout fires; a task whose work
  is still pending is skipped (not restarted) on the next cycle and reported as `stuck`.
- One scheduler owns both jobs (hourly warm, 20-minute strategies refresh) behind one
  mutex, so they never overlap; the strategies refresh becomes the last warm task and
  an extra standalone run at the 20- and 40-minute marks.
- Order: reference rates → top vaults → crypto vaults → stablecoin metadata → search
  index and `all-data` payload → `top-vaults/chart-data` → hub chart payloads
  (historical TVL chain/protocol/stablecoin, CORE3 risk, heatmap, yield-chain) → mini
  charts for the 20 largest protocols, stablecoins and curators by TVL → API strategies
  and YAML share-price returns → strategies page snapshot (the existing refresh).
- Not warmed: per-vault `metrics` (thousands of vaults, 250–700 KB each; the 100-entry
  LRU plus the 1 h edge cache stays), and anything keyed by arbitrary query strings.
- `src/routes/_internal/cache/warm/+server.ts`: same token check as the strategies
  endpoint (extract `tokenMatches` to a shared module, rename the env var to
  `TS_PRIVATE_INTERNAL_REFRESH_TOKEN`), `private, no-store`, returns per-task duration
  and status. Runs single-flight; a second call while one is running returns 409.
- `scripts/server.js`: the scheduler above — warm-all at start-up and every 60 minutes.
  How long a full warm takes is unknown: measure it on production data before
  promising a figure. Requests arriving before it completes use the cold-load path. If
  the measured cold start is long enough to matter after deploys, persist the validated
  export snapshot to the existing `strategies-cache` volume (same atomic-write pattern
  as PR #1401) and load it at start-up; decide on the measurement, not up front.
- Under `pnpm run dev` there is no scheduler; the cold-load path covers it. The
  integration harness (`tests/helpers.ts`) starts the build without `scripts/server.js`
  timers, so it cannot cover the scheduler: add a dedicated test that boots
  `scripts/server.js` against the mock API and asserts an authenticated warm succeeds,
  overlapping triggers are serialised, and a task that outlives its timeout is not
  restarted.
- `/diagnostics` gains a table of cache name, age, last duration, last error, read from
  `status()`. No secrets or paths.

### Edge caching (the "2" part)

- Home page: it is already edge-cached for 30 minutes, and it inherits the same
  request-dependent state as the hubs (`admin` and `ipCountry` from
  `src/routes/+layout.server.ts`, the colour-mode attribute from `handleColorMode`).
  **Before changing anything, audit the existing Cloudflare Cache Rule for `/`:** its
  cache key and bypass conditions (cookies `pw`, `ts-color-mode`; country) are only
  visible in the dashboard, and the code alone cannot show that today's caching is
  safe. Record the result in `docs/cache-invalidation.md`; fix the rule or the page if
  one visitor's state can reach another.
- Only after that audit passes: add `stale-while-revalidate=3600` to the home page's
  `Cache-Control`. Cloudflare revalidates asynchronously, so this is a real behaviour
  change — expired copies are served for up to an hour longer — not a no-op.
- Hub and vault HTML stays uncached at the edge in this round. Reasons: the root
  `+layout.server.ts` reads `locals.admin` and `locals.ipCountry`, and `handleColorMode`
  writes a cookie-dependent attribute into the HTML, so a shared copy could leak one
  visitor's state to another. With warm caches the origin answers these pages in
  70–330 ms, so the gain is one network hop. Listed under "Open decisions".
- Collapse the two-hop legacy redirect (`/trading-view/<chain>/vaults/<slug>?a=` →
  `/vaults/address/<a>` → `/vaults/<slug>`) into one by resolving the slug in the first
  handler; each hop costs a mobile round trip and counts towards TTFB.

### Tests

- Unit: the cache helper (stale served during refresh, failed refresh keeps value, single
  flight, cold load awaited once, overdue fallback) and the warmer (order, a failing task
  does not stop later ones, timeout, 409 while running).
- Integration: `/_internal/cache/warm` is 401 without the token; home page renders with
  the mock API when the top-vaults cache is warm.
- Docs: `docs/cache-invalidation.md` (new "Background cache warmer" section and table),
  `docs/vault-data-source.md`.

## 3. Faster first paint with standard techniques (PR 2)

Each item is an experiment judged by the PR 0 probe (HTTP/2 A/B, median of 5, all URLs).
Ship only what improves median FCP/LCP by more than run-to-run range and regresses no URL.

| #   | Technique                            | Change                                                                                                                                                                                                                                                                               | Expectation and risk                                                                                                                                                                                                                                                                                                                                                                                      |
| --- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| a   | Fewer render-blocking requests       | `inlineStyleThreshold` matrix: 8192 (now), 16384, 40960, `Infinity`                                                                                                                                                                                                                  | Removes up to 6 requests. HTML grows by the non-cacheable CSS. Round 5 saw FCP −70…−310 ms; re-judge with the probe.                                                                                                                                                                                                                                                                                      |
| b   | One CSS and fewer JS files           | `kit.output.bundleStrategy: 'single'` (and `'split'` + Rollup `output.experimentalMinChunkSize` ≈ 10 KB as the milder variant)                                                                                                                                                       | 100–130 one-kilobyte chunk requests collapse. `'single'` sets `inlineDynamicImports`, so every lazily imported module (wallet code, chart components) is parsed and executed on first load; ECharts stays separate only because `src/lib/echarts/runtime.ts` imports it as a URL asset. Judge on main-thread time, TBT and warm navigation, not request count. The milder variant is the likelier winner. |
| c   | Smaller critical CSS                 | Find why `TradingDataInfoRow.css` (37 KB) and `0.css` (37 KB) load on every page; move global `@import`s out of a leaf component chunk; delete dead rules found with Chrome coverage on the URL set                                                                                  | Fewer blocking bytes regardless of a/b.                                                                                                                                                                                                                                                                                                                                                                   |
| d   | No third-party requests before paint | Proxy `app.xerberus.io/favicon.ico` (53 KB) and `core3.io/images/fav-icon-32.png` through `/metadata-logo/…webp` or bundle them as static logos; add `loading="lazy"` and explicit sizes                                                                                             | Removes two origins' connection set-up on hub and vault pages.                                                                                                                                                                                                                                                                                                                                            |
| e   | Late, low-priority analytics         | Cloudflare Insights beacon is injected by Cloudflare at High priority; check whether the dashboard's manual snippet with `defer` at end of body lowers it                                                                                                                            | Small; skip if not controllable.                                                                                                                                                                                                                                                                                                                                                                          |
| f   | Faster in-site navigation            | `data-sveltekit-preload-data="tap"` on `<body>` (currently unset) and `preload-code="hover"`. In-site links are SvelteKit client transitions, so Speculation Rules (which prefetch documents) do not help them; consider those only for real document navigations such as blog → app | Better perceived speed. Client transitions are soft navigations, which CrUX reports only experimentally, so do not expect this to move the stable LCP series. Watch origin load from preloading.                                                                                                                                                                                                          |
| g   | Back/forward cache                   | Run Lighthouse's bfcache audit on the URL set; remove blockers (`unload` handlers, `no-store`)                                                                                                                                                                                       | Instant back navigation counts as a very fast LCP in field data.                                                                                                                                                                                                                                                                                                                                          |
| h   | Head size                            | Keep JSON-LD after CSS. Do **not** remove the 19–27 `<link … disabled media="(max-width: 0)">` tags: SvelteKit emits them on purpose (`runtime/server/page/render.js`) so Vite sees the inlined stylesheets as loaded and does not request them again                                | Nothing to gain; listed so nobody "cleans them up".                                                                                                                                                                                                                                                                                                                                                       |
| j   | Stream non-critical server data      | Return below-the-fold data (blog posts on `/`, lower tables on curator pages) as un-awaited promises from server `load` so the shell flushes first, with reserved boxes                                                                                                              | Cuts TTFB-to-paint when a dependency is slow. Streamed data is absent from the first HTML chunk: only for content that does not need to be indexed in place, and no layout shift.                                                                                                                                                                                                                         |
| k   | Modular ECharts build                | Replace the self-hosted full runtime with a tree-shaken `echarts/core` build registering only the chart and component types the site uses                                                                                                                                            | Addresses the 172 KB of unused JS on hub pages; pairs with the deferral in section 4.                                                                                                                                                                                                                                                                                                                     |
| l   | Break up long tasks                  | Where the interaction probe shows a handler over 50 ms (table sort/filter over 75+ rows), yield with `scheduler.yield()`/`await tick()` between phases or defer non-visible rows                                                                                                     | Direct INP lever.                                                                                                                                                                                                                                                                                                                                                                                         |
| i   | Compression                          | Confirm Cloudflare serves HTML with Brotli or Zstandard at a sensible level and that `Content-Length`-less streaming is not disabling it                                                                                                                                             | Check only.                                                                                                                                                                                                                                                                                                                                                                                               |

Already in place, keep: CSS-only `Link`/Early Hints, hero image preload with
`fetchpriority="high"`, deferred font stylesheet, metric-matched fallbacks.

## 4. Lighter hub pages (PR 3)

Earlier work, so it is not repeated: #1203 (vault layout load server-only), #1328
(inline small listings), #1355 (initial batch 150 → 75 rows), #1360 (home payload),
#1401 (strategies snapshot), the `VaultListingRow` projection, and
`docs/vault-data-optimisation-plan.md`, which leaves "reducing fields within listing
responses" as the open optimisation. That is this section.

### Hydration data (264 KB → target about 100 KB)

Audit every key in `vaultListingRowKeys` / `vaultListingPeriodMetricKeys`
(`src/lib/top-vaults/schemas.ts`) against what the table, its cells, the client-side
sort/filter pipeline and CSV export actually read, then:

Step 1 is behavioural-equivalence fixtures, before any byte target: a fixture listing
covering a depegged stablecoin, a non-USD denomination with native rates, a vault with
differing gross and net fees, missing fees, pool-specific and protocol-level Xerberus
ratings, CORE3 ratings, sort ties, and short-history vaults. The tests assert that the
rendered cells, tooltips, sort order, filters, comparison availability and CSV export
are identical before and after each trim. Then, one trim per commit:

- `denomination_token_rate`: 12 fields per row, mostly `null`. It is consumed — the USD
  rate, source currency and native-rate fields feed `top-vaults/helpers.ts`, and a
  missing rate is treated as `1`, which would hide a depeg. So only drop sub-fields that
  no consumer reads (the `*_fetched_at` / `*_source` provenance fields are candidates),
  never the object.
- `xerberus` and `core3`: repeated objects, but a Xerberus assessment can be
  pool-specific with its own entity id and report URL. Deduplicate by assessment
  identity (`entity_type` + `entity_id`) into one lookup table in the page data, with
  rows holding the key; do not assume one per protocol.
- `gross_fees` / `net_fees` are different fee schedules, and `net_fees` decides whether
  a vault can be compared net of fees (`equity-comparison/net-returns.ts`). Keep both.
  The possible saving is the top-level `mgmt_fee` / `perf_fee` / `fee_mode` copies, if
  the audit shows every reader can use `gross_fees`.
- `period_results`: the period timestamps drive the coverage tooltips
  (`return-columns.ts`), so they stay. Drop only fields no column, tooltip or sort reads.
- Float rounding: the server paginates on full precision and the client re-sorts loaded
  rows (`TopVaultsTable.svelte`), so rounding can reorder near-ties across the
  continuation boundary. Only round fields that are display-only, or keep a stable
  tie-break (vault id) on both sides and prove it with the tie fixture.
- Omitting `null`s: readers use strict `=== null` checks in places. Either keep nulls or
  change the row type to optional and fix every reader in the same commit; the type
  checker plus the fixtures must cover it.
- The same projection serves the continuation responses, so they shrink too.
- Guard: a unit test serialises the fixture listing and fails above a per-row byte
  budget set from what the equivalence tests allowed, not from a number chosen up front.
  The 100 KB figure above is a hope, not a requirement.

### Markup and main-thread work (271 KB rows, 3.4 s main thread)

- Measure first with the probe plus a Chrome performance profile: split the 949 ms of
  Svelte runtime scripting into hydration of rows, tooltips and charts.
- Row markup: every cell wraps content in `Tooltip` (`<dfn><span class="trigger …">`)
  even where the popup is empty. Render the wrapper only when there is tooltip content,
  or attach one delegated tooltip per table. Fewer components per row cuts markup,
  hydration time and class-attribute bytes (145 KB of the body is `class="…"`).
- Initial row count: test 75 → 40 with rows 41–75 fetched by the existing continuation
  request on idle rather than on scroll, so the links are still present shortly after
  load. This halves payload, markup and hydration at once; it is listed under "Open
  decisions" because fewer server-rendered vault links may matter for SEO.
- `content-visibility: auto` with `contain-intrinsic-size` on below-the-fold sections
  (footer, newsletter, lower tables on curator pages). Test whether it can apply to row
  groups; table rows cannot take size containment, so this may need several `<tbody>`s.
- ECharts: import the runtime and build the hub chart when its container is near the
  viewport or the browser is idle, not during hydration; keep the reserved box so CLS
  stays 0. On phones the chart is below the "About" text. Deferral only moves work:
  check with the interaction probe that it does not land on the user's first tap.
- Site chrome on every page: mobile navigation (26 KB) rendered closed — render its
  body on first open; two footer variants (27 KB) — render one; the 9.8 KB logo SVG is
  inlined twice — reference one `<symbol>` or an external cached file; repeated icon
  SVGs likewise.
- Curator pages render up to three tables (748 KB): the BTC and ETH tables from #1493
  start with a smaller initial batch than the stablecoin table.

Acceptance: probe medians on the Morpho hub and the Steakhouse curator page — HTML
under 400 KB, TBT under 300 ms (8 s window), LCP unchanged or better, CLS 0, and no
interaction in the interaction probe slower than before; integration tests for
listing sort, filter, continuation, comparison checkboxes and tooltips still pass
(with `waitForHydration` where they interact right after load).

## 5. Non-blocking fonts and the white screen (PR 4, small)

The goal is that no font can delay first paint. The white screen in finding 7 is treated
as a separate, unexplained problem: do not assume fonts cause it.

1. **Investigate first** (Measurement step 3): Linux container and a real Android
   phone, fresh profile, Chrome trace. Name what holds back first paint in PSI's
   environment. Candidates to rule in or out from the trace: font loading, the six
   blocking stylesheets under PSI's network, the 26–39 KB inline CSS parse, a
   compositor/raster delay specific to headless Linux (in which case it is a lab
   artefact and nothing ships for it).
2. **Audit what can block text today:**
   - Web fonts are `font-display: optional` and their stylesheet is deferred
     (`media="print"` swap) — at most a very short block, by design. Confirm in the
     trace that neither the deferred link nor the `Link: rel=preload` font headers are
     render-blocking, and that the three woff2 preloads do not delay first paint on the
     throttled probe; if they do, drop them everywhere (already off on `/`).
   - The `… Fallback` faces are `local()`-only. Chromium shows a visible fallback while
     a local lookup is pending and falls through when a face is missing, so they should
     not block. Verify on the Android run rather than assume.
3. **Ship `font-display: swap` on the `… Fallback` faces only if step 1 or 2 shows a
   blocked-text period attributable to them.** It is harmless on macOS/Windows, but an
   unexplained change is not a fix; if the measurements show no block, record that in
   `docs/speed.md` and change nothing.
4. Check the font stacks in `typography.css` / `typography-new.css` end in a plain system
   family (`system-ui, sans-serif`, `monospace`, `serif`) after the fallback face.
5. Tests: `tests/integration/layout-shift.test.ts` must stay under CLS 0.05. Update
   `docs/speed.md` with the trace findings either way.

## Delivery: one PR, five milestones

Everything ships in one PR (branch `mobile-speed-round-2`). Each milestone is one or more
self-contained commits that pass `pnpm run check`, `lint` and the unit tests on their own,
so the PR can be reviewed commit by commit and a milestone can be reverted alone.
References to "PR 0 … PR 4" elsewhere in this plan mean milestones M0–M4.

| Milestone | Content                                                               | Depends on                      |
| --------- | --------------------------------------------------------------------- | ------------------------------- |
| M0        | `perf:probe` (load + interaction), baseline in `docs/speed.md`        | —                               |
| M1        | Cache helper, warmer, callers, redirect hop, docs                     | M0 for before/after             |
| M2        | White-screen investigation; font change only if the trace supports it | M0                              |
| M3        | Hub payload, markup, ECharts deferral                                 | M0                              |
| M4        | CSS/JS delivery experiments; only measured winners are committed      | M0; after M3 so sizes are final |

Things the PR cannot do itself, listed in the PR description for the user: the
Cloudflare Cache Rule audit for `/` (dashboard), a real Android phone run, the
`stale-while-revalidate` change on `/` (blocked on the audit), and after release the
production probe, "Validate fix" in Search Console and `pnpm run seo:cwv --history`
four weeks later.

## Open decisions for the user

1. Initial listing rows 75 → 40 (section 4): biggest single win for hub weight, but
   fewer vault links in the server-rendered HTML.
2. Edge-caching hub and vault HTML (section 1–2): needs colour mode, admin and country
   handling moved out of the HTML first. Proposed: not in this round.
3. `bundleStrategy: 'single'` (section 3b): fastest repeat views, heavier very first
   view. Decide on probe numbers.

## Review log

Codex (`gpt-6-astra`, read-only, 2026-11-22; GPT 6.2 Astra was requested but is not
available to Codex on this account). Findings and what changed:

| #   | Finding                                                                                            | Change                                                                             |
| --- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 1   | Sequential tasks do not bound concurrency; timeouts leave work running; strategies job overlaps    | Abort signals, lock held until work settles, one mutex for both jobs               |
| 2   | Row trims were not equivalent (pool-specific Xerberus, gross vs net fees, token rates hide depegs) | Equivalence fixtures first; each trim narrowed                                     |
| 3   | Home page shares the hubs' personalisation risk; Cloudflare SWR is real, not a no-op               | Cache Rule audit before any change                                                 |
| 4   | "No upstream waits" was overstated (Ghost posts, protocol metadata, cold start)                    | Guarantee scoped; both dependencies added                                          |
| 5   | Failure and freshness contracts unspecified; 60 s strategies TTL                                   | Loader/getter split, backoff, max source age, TTLs kept                            |
| 6   | No CPU/memory budget; derived caches depend on more than `generated_at`                            | Event-loop and RSS measurement, worker-thread fallback, input versioning, eviction |
| 7   | `local()` fallbacks do not block in Chromium; Linux is not Android                                 | Font section rewritten as investigation; change is conditional                     |
| 8   | Disabled stylesheet links are needed; `'single'` inlines dynamic imports                           | Row h reversed, row b caveated                                                     |
| 9   | Probe did not cover INP; wrong tracing API                                                         | Interaction probe, field attribution, CDP tracing                                  |
| 10  | Speculation Rules do not help client routing; soft navs are experimental in CrUX                   | Row f corrected                                                                    |
| 11  | Payload tests need semantics (rounding vs pagination, nulls, timestamps); harness has no scheduler | Fixtures listed; dedicated scheduler test                                          |
| —   | Missing techniques: streaming, modular ECharts, long-task splitting                                | Rows j, k, l                                                                       |

## Out of scope

- Visible UI, copy or layout changes.
- Per-vault metrics pre-warming, moving caches to Redis/R2, multi-process deployment.
- Ghost blog and docs site performance.
