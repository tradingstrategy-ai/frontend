# SEO and Core Web Vitals follow-ups

## Status (2026-09-16)

Implemented on branch `seo-follow-ups`; outcomes are recorded in `docs/google-webmasters.md`, "Follow-up round — 2026-09-16". The CLS root cause turned out to be the announcement banner (module-level store shared across server renders), not the table or chart; workstream 1 items 2–3 were measured and not needed. Workstream 6 waits for the next recrawl, workstream 9 for the LCP validation result, workstream 7's content work lives in the docs repository.

## Goal

Second round of search-experience work after PR #1435 (see `docs/google-webmasters.md`, "Optimising the website — 2026-09-16" and "Post-release Search Console actions"). Eleven items, ordered by value per effort. Each workstream is independently shippable; items 1–2 unblock Search Console fix validation and should go first.

Success criteria, checked with `pnpm run seo:cwv --history`, `pnpm run seo:search-console pages|queries` and the Search Console UI:

- Mobile CLS issue (354 URLs on the token and pair templates) validated as fixed; mobile CLS p75 ≤ 0.05.
- No token or pair page with an adult/gambling name indexable regardless of liquidity.
- Strategy page CTR above 1 % at the same positions (currently 0.15 %).
- Page indexing report: "blocked by robots.txt" and "page with redirect" counts falling; no pair URLs submitted by sitemaps.

## Workstream 1 — CLS on token and pair pages

Search Console groups the mobile CLS issue into two templates: token pages (`/trading-view/<chain>/tokens/<addr>`, 219 URLs, group CLS 0.11) and pair pages (`/trading-view/<chain>/<exchange>/<pair>`, 135 URLs, 0.11). Lab runs on the same page swing between 0.00 and 0.36, which points at content that mounts after first paint without reserved space rather than a constant shift.

### Suspects (verified in code)

1. **Pairs table on token pages** — `src/routes/trading-view/[chain=slug]/tokens/[token]/+page.svelte:84` renders `PairTable` from a client-side store (`getPairsClient`). While `loading`, `PairTable.svelte:48` substitutes ten empty `{}` rows; neither `PairTable` nor `DataTable` (`src/lib/components/datatable/DataTable.svelte`) declares a row height, so whether the skeleton and data rows match in height on mobile is unverified and must be measured first.
2. **Candle chart on pair pages** — `[pair]/+page.svelte:131` mounts `PairCandleChart` inside `{#await import(...)}` with no placeholder; `.charts` (line 197) has no `min-height`, so the section grows from 0 to the chart height once the ~300 KB lightweight-charts bundle arrives.
3. **Announcement banner slide-out** — `AnnouncementBanner.svelte:47` uses `out:slide` on dismiss; a user-initiated shift is exempt from CLS only within 500 ms of the input, and the slide lasts 750 ms. This can only explain shifts on sessions where the user dismisses the banner, so shortening it is a hygiene fix, not proof of a field improvement.
4. ~~Fonts are already `font-display: swap` with size-adjusted fallbacks per `docs/speed.md`; do not touch unless the audit points there.~~ Correction (2026-09-17): the fonts were `swap` but had **no** size-adjusted fallbacks, and `docs/speed.md` described a mechanism that no longer existed; the swap was measured as a 0.25 CLS on glossary pages and fixed in round 3 (`.claude/plans/seo-round-3.md`, workstream 3).

### Changes

1. Reproduce first: run PageSpeed Insights (mobile) five times each on the EverPorn token page and `/trading-view/ethereum/uniswap-v2/ctgpt-eth` (the two group examples) and read `cls-culprits-insight`; also record a Chrome DevTools performance trace with "Layout shifts" on a throttled mobile profile. Do not change anything until the culprit element is named.
2. Pairs table: measure the real mobile row height, then add a `rowHeight` (or `minRowHeight`) prop through `DataTable` and its body-row implementation so skeleton and data rows are the same height, and reserve the token page's table wrapper with that value. A wrapper-only `min-height` must account for the heading, footer and pagination controls, not just the rows.
3. Candle chart: render a fixed-height placeholder (`aspect-ratio` or `min-height` equal to the chart's rendered height per breakpoint) in the `{#await}` pending branch and keep the `.charts` section at that height, so the chart mount replaces content of equal size.
4. Banner: shorten `out:slide` to ≤ 400 ms so the dismissal shift stays inside the user-input exemption window.
5. Add a Playwright layout-shift check for the token and pair integration pages: install a `layout-shift` `PerformanceObserver` with `page.addInitScript` _before_ `goto`, collect entries with `hadRecentInput === false`, deliberately delay the client-side `pairs` request with `page.route` so the table transition is observable, and assert the cumulative score is below 0.05. On the pair page assert on the reserved chart container, not on canvas rendering (chart rendering is skipped on CI in `pair-details.test.ts`).

### Verification

PSI `cls-culprits-insight` empty on both group examples; then in Search Console start "Validate fix" on the CLS issue (it was deliberately not started on 2026-09-16). Field confirmation takes the 28-day CrUX window.

## Workstream 2 — name blocklist for offensive token and pair names

Four pages with real liquidity but adult names survive the thresholds (PornForce $225k, Nude AI $115k, PORNHUB-ETH $53k TVL, XXX-BNB $9k TVL).

### Changes

1. In `src/lib/explorer/indexing.ts` add `NOINDEX_NAME_PATTERN` and a shared `hasBlockedName(values)` helper, applied to the token `name` and `symbol`, and to the pair `pair_symbol`, `pair_name` and `base_token_symbol`. Extend `TokenIndexingMetrics` and `PairIndexingMetrics` with those optional display-name fields, and type `base_token_symbol` explicitly in `PairInfo` (`src/lib/explorer/pair-client.ts`; it is currently reached through the index signature). Normalise with `toLowerCase()` and NFKD before matching, and treat `-`, `_` and `/` as word separators so hyphenated pair symbols (`PORNHUB-ETH`) match. Word-boundary aware so "Alphabet", "analysis", "Zeus", "888" and "QQ" do not match:

   ```
   porn, xxx, nude, sex, fuck, cock, pussy, boob, tits, milf, hentai, bokep, xhamster, xnxx,
   brazzers, onlyfans, casino, poker, jackpot, lottery, gacor, togel, slot (whole word),
   bet (whole word), cum (whole word), anal (whole word)
   ```

2. `isTokenIndexable` / `isPairIndexable` return `false` when the pattern matches, before the liquidity check. Unit-test the four escapes above (including the hyphenated pair symbols) as not indexable and a legitimate set (USDT, "Alphabet", "Super AI", "ZEUS", "Longinus", "QQ4", "Analytics DAO") as indexable. The list is English-only by design; obfuscated or non-Latin names are out of scope and the pattern's owner is whoever maintains `indexing.ts`.
3. Re-run the dry-run from the audit (top 500 pages by clicks) and confirm that only the four pages change.

## Workstream 3 — strategy page titles and descriptions

130 `/strategies/<id>` pages: position ~10, CTR 0.15 %. `[strategy=apiStrategy]/+page.svelte:25` sets `<title>{strategy.name} | Trading Strategy</title>` and the description from `strategy.short_description`.

### Changes

1. Title pattern that states what the page is: `{name} — automated DeFi vault on {chain} | Trading Strategy`, with the current return in the description when available: `"{name}: {return}% annualised, {tvl} TVL. Automated DeFi trading vault on {chain}."`. The two route types expose different fields, so implement two formatters behind one helper (`src/lib/trade-executor/helpers/seo.ts`):
   - API strategies (`[strategy=apiStrategy]/+page.svelte:24`): `getMetricsWithAltCAGR(strategy).cagr` and `total_equity` (`src/lib/trade-executor/helpers/metrics.ts:13`), `chain.name`.
   - YAML strategies (`[strategy=yamlStrategy]/+page.svelte:21`, metrics at line 43): `vaultInfo.one_month_cagr_net` and `current_nav`, `chain?.name`.
     Truncate on rendered length (60 title / 155 description characters) and fall back to `short_description` whenever a required value is null, zero or negative; never print "NaN%".
2. Content change, not engineering: the top ten strategies' `short_description` values should be reviewed by hand for search intent.

### Verification

Search analytics `queries` filtered to `/strategies/` pages four weeks after deploy; target CTR > 1 %.

## Workstream 4 — stop exposing crawl-blocked and redirecting URLs

Page indexing report: 1,633 "blocked by robots.txt", 4,522 "page with redirect", 377 "soft 404", 161 "server error (5xx)". The API does not expose these lists, so the first step is the Search Console UI export (Pages → each reason → Export).

### Changes

1. Export the four lists and classify by URL pattern. Nothing in this workstream is decided until the exports are read: a grep of the templates finds **no** internal `<a href="/api/...">` links (the two `/api/explorer/` anchors are external documentation links), and only one same-origin `.json` anchor — the raw trade data link in `src/routes/strategies/[strategy=apiStrategy]/[status=positionStatus]-positions/[position=integer]/trade-[trade=integer]/+page.svelte:55`, which `robots.txt` (`Disallow: /*.json$`, `static/robots.txt:7`) blocks by design.
2. Blocked by robots.txt: if the exported URLs are that `trade-*.json` link, decide whether it becomes `rel="nofollow"`, a button, or stays as a crawl-blocked but user-accessible link; if they are something else (old API endpoints linked from outside), no template change is needed. Do not unblock the API.
3. Page with redirect: most likely sitemaps or internal links to pre-consolidation vault URLs (`/trading-view/vaults/...`, `/vaults/categories/...`). Fix at the source (sitemap generators in `src/routes/**/sitemap.xml`, internal links) so Google is only offered final URLs.
4. Soft 404: identify the template from the export. Upstream 404s already become SvelteKit 404s on the token and pair loaders (`src/lib/helpers/public-api.ts:44` preserves 4xx and only converts 5xx to 503), so those routes need no loader change; the candidates are templates that render successfully with near-empty content (e.g. `/vaults` category or protocol listings with zero rows, or the `/trading-view/vaults` redirect Google still classifies as soft 404). Pages that legitimately exist but are empty should say so with real content.
5. 5xx: correlate with Sentry for the same URLs; likely upstream timeouts on heavy pair pages. Out of scope to fix here beyond noting the pattern.

### Verification

Page indexing counts in the UI after the next full recrawl (weeks). No template assertion is added until the exports show which URLs Google is actually finding.

## Workstream 5 — sitemap housekeeping

1. Re-register the vault sitemap without the `?version=2` query string in Search Console (UI action) and remove the old entry; confirm `src/routes/vaults/sitemap.xml` serves it at the plain path.
2. Ask the docs site owners to update `defi-vault-data.html` links from `/trading-view/vaults` to `/vaults`, and the glossary content owners for the same (`glossary/trading-strategy-framework` links to `/trading-view/vaults/stablecoins`).
3. Investigate the 37 warnings on `glossary/sitemap.xml` from the UI (the API only returns the count).

## Workstream 6 — index bloat diagnosis

Overlaps with workstream 4 but covers the remaining reasons: 1,256 "alternate page with proper canonical tag" (expected: parameterised URLs now resolving to the canonical) and 549 "duplicate without user-selected canonical" (should fall to zero now that `CanonicalLink` ships on trading-view and glossary pages).

### Changes

1. After the next full recrawl, export both lists; anything remaining in "duplicate without user-selected canonical" indicates a route still lacking a canonical — add `CanonicalLink` there (or finish workstream 10).
2. Track the total indexed count (29.2K on 2026-09-16) as the `noindex` set drops out; a fall of roughly 2,000 token/pair pages is expected and correct.

## Workstream 7 — glossary rankings

200 glossary pages average position 35; generic terms sit at 60–75 (`leverage`, `CAGR`, `stop-loss`, `volatility`). The root-URL move was tried and reverted on 2026-09-16; this is the alternative.

### Changes

1. Classify terms into (a) DeFi/vault-specific terms that already rank on page one (`hyperliquid-provider-vault`, `alpha-signal`) and (b) generic finance terms competing with Investopedia-class sites.
2. For (a): deepen the content in the source Sphinx glossary (it is scraped from `tradingstrategy.ai/docs/glossary.html`) and add internal links from the vault and strategy pages that use the term (the tooltip "Read more" links already exist for some; make them consistent).
3. For (b): either leave as is (they cost nothing) or de-emphasise by dropping them from `glossary/sitemap.xml` priority 1.0 to 0.3. Do not `noindex` them.
4. The FAQ structured data on term pages is fine; do not add more schema.

## Workstream 8 — `/vaults` main-thread work

Lab: 949 ms long task and up to 10 s main-thread on `/vaults`, attributed to the Svelte runtime chunk during `TopVaultsTable` hydration (75 rows, 16 cells each, lazy tooltips now).

### Changes

1. Profile with the Chrome performance panel on a throttled CPU; look for per-row `$derived` recomputation across the whole `accumulatedVaults` array on every state change, and for layout reads (`getBoundingClientRect`, `offsetWidth`) inside sort/format helpers or the comparison-selection code.
2. Likely fixes: memoise per-row derived values keyed by vault id, move sorting out of the render path (sort once on data change, not per render), and defer non-visible rows (`content-visibility: auto` on `tbody tr` with `contain-intrinsic-size` set to the row height).
3. Re-measure TBT and the long task with PSI; target TBT < 300 ms on mobile.

## Workstream 9 — inline the large shared stylesheets (inlineStyleThreshold step B)

Only after the LCP validation started on 2026-09-16 reports (by ~14 October) and `pnpm run seo:cwv --history` shows the step-A effect.

### Changes

1. Raise `kit.inlineStyleThreshold` in `svelte.config.js` from 8192 to ~40 000 so the seven shared chunks (root layout 37 KB, `TradingDataInfoRow` 40 KB, `TopVaultsPage` 28 KB, …) inline too; this removes the last 4–6 render-blocking requests at roughly +15 KB gzipped per document and no cross-page CSS caching.
2. Compare document `transferSize` and PSI LCP before/after on the seven audit pages; keep only if LCP improves in the field over the following window.

## Workstream 10 — one canonical mechanism

`canonical={pageUrl}` is passed to `svelte-meta-tags` at 36 call sites, `CanonicalLink` has nine placements, and roughly 40 routes with a `<svelte:head>` still declare none. `svelte-meta-tags` emits a canonical whenever the prop is supplied (`node_modules/svelte-meta-tags/dist/MetaTags.svelte:63`), so the switch must be atomic: `AppHead` emission and removal of all 36 props land in the same change, never separately.

### Changes

1. Emit `<link rel="canonical">` once from `src/lib/header/AppHead.svelte` using `getCanonicalUrl(page.url, { lowercasePath: page.data.lowercaseCanonical })`, driven by page data the same way `robots` is.
2. Remove `canonical={pageUrl}` from the 36 `MetaTags`/`SocialCardMetaTags` call sites (keep `og:url`), delete `CanonicalLink` and its nine placements, and set `lowercaseCanonical: true` in the token page loader.
3. Guard: an integration assertion on a sample of routes (home, vault, strategy, blog post, token, pair, glossary, search, about) that exactly one canonical tag is present and equals origin + pathname, including a query-string URL and a mixed-case token address.

## Workstream 11 — stop submitting the pair sitemaps

The frontend sitemap index (`src/routes/sitemap.xml/+server.ts`) probes the backend for `api/sitemap/pairs/paged/N.xml` and lists every page found. Those sitemaps submit thousands of pair URLs, most of which now carry `noindex`, which Search Console reports as a conflict and which wastes crawl budget.

### Changes

1. Delete `getPairSitemaps`/`sitemapExists` and the spread into `sitemaps` in `src/routes/sitemap.xml/+server.ts`; keep `api/sitemap/exchanges/sitemap.xml` (exchange pages are few and not `noindex`).
2. Update `tests/integration/sitemap-index.test.ts`: remove `'pairs/paged/0'` from the expected entries and add an assertion that no entry contains `pairs/paged`.
3. Discovery risk, stated plainly: the pair sitemaps are the only exhaustive list of pair URLs. Exchange pages render their pairs through a client-fetched paginated table (`[exchange]/+page.svelte:98`) and chain pages list only a short "highest TVL" set (`TopPairs.svelte`), so being "reachable" does not mean every indexable pair is linked in server-rendered HTML. This change is a deliberate decision to stop advertising the long tail: the indexable pairs that matter (high TVL/volume) are linked from token pages, chain top-lists and vault pages, and Google already knows the existing URLs. Before removing, measure how many of the _indexable_ pairs (per `isPairIndexable`) in the current sitemaps are linked from server-rendered HTML; record the number in `docs/google-webmasters.md`. If it is low, follow up with a backend sitemap that lists only indexable pairs.
4. Removing the sitemap does not stop crawling of internally linked `noindex` pages; that is fine — `noindex,follow` is the intended state.
5. Document in `docs/google-webmasters.md` and remove the "backend ticket" note from the earlier plan.

## Rollout order

1. Workstream 2 (blocklist) and 11 (pair sitemaps) — small, no measurement dependency.
2. Workstream 1 (CLS) — reproduce, fix, validate.
3. Workstream 3 (strategy titles) and 5 (sitemap housekeeping).
4. Workstream 4 and 6 (index reports) once the UI exports are in hand.
5. Workstream 8, 10, 7 as capacity allows; 9 only after the LCP validation result.
