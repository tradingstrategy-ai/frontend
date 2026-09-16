# SEO and Core Web Vitals remediation

## Goal

Act on the findings of the 2026-09-16 site audit in `docs/google-webmasters.md` ("Site audit 2026-09-16"). The audit found that (1) organic search traffic is dominated by near-empty spam-token pages, (2) mobile Core Web Vitals sit at the edge of "good" with CLS drifting up, (3) ~4,000 indexed pages have no canonical tag, and (4) the glossary and blog ship far more bytes than they render. Each workstream below is independently shippable; the order is the recommended priority.

Success criteria, measured with `pnpm run seo:cwv --history` and `pnpm run seo:search-console pages` four to six weeks after each change lands:

- Mobile CLS p75 back at or below 0.05 (currently 0.09; limit 0.10).
- Mobile LCP p75 below 2,000 ms (currently 2,358 ms).
- Search Console "needs improvement" mobile URL count falls from 306 towards zero.
- Token-page share of impressions drops from 83 % and the top-query list stops being adult/gambling token names.

## Baseline (do first)

Capture the before-state so the after-state is comparable:

1. Run `pnpm run seo:cwv --history --json > ~/.tradingstrategy/seo-baseline-crux.json` and `pnpm run seo:search-console pages --limit 5000 --json > ~/.tradingstrategy/seo-baseline-pages.json`. Keep these outside the source tree.
2. Record PageSpeed Insights mobile scores for the seven representative pages in the audit table. Lab numbers vary ±30 % between runs; take the median of three.

## Workstream 1 — stop indexing low-quality token and pair pages

Problem 1 in the audit. Token detail pages (`/trading-view/<chain>/tokens/<addr>`) and pair pages (`/trading-view/<chain>/<exchange>/<pair>`) exist for every token the backend has ever seen. The pages with the most impressions have under $1 of liquidity and zero volume.

### Data available

The live `token/details` payload (checked 2026-09-16 against the EPORN token) returns `liquidity_latest`, `tvl_latest`, `volume_24h` and `pair_count`. Only `liquidity_latest` and `volume_24h` are used by the UI today and present in `tests/mocks/tokens/detail.mock.json`; treat `tvl_latest` as optional and add it to the fixture. `pair-details.summary` returns `pair_tvl`, `usd_liquidity_latest`, `usd_volume_24h` and `usd_volume_30d` (all present in `tests/mocks/pairs/detail.mock.json`). No new backend field is needed for a first version.

### Changes

1. Add `src/lib/explorer/indexing.ts` exporting `isTokenIndexable(token)` and `isPairIndexable(summary)`. A page is indexable when **either** the liquidity/TVL or the volume signal clears its threshold:
   - token: `max(liquidity_latest, tvl_latest ?? 0) >= 5_000` or `volume_24h >= 1_000`
   - pair: `max(pair_tvl, usd_liquidity_latest) >= 5_000` or `usd_volume_30d >= 1_000`
     Put the thresholds in exported constants so they can be tuned without touching the pages. **Missing data is not low quality**: when every metric the helper reads is `null`/`undefined`, return indexable (unknown), and only return not-indexable when at least one metric is a confirmed number below threshold. Unit-test both helpers (Vitest) for the all-null case, mixed null/number cases and the boundary values.
2. Before enabling, quantify the blast radius with a dry-run script (scratch, not committed): take the top 500 pages by clicks from `pnpm run seo:search-console pages --limit 500 --json`, fetch each token/pair from the public API and print which would become `noindex`. Review that list by hand; if it contains pages that clearly should rank, adjust the thresholds first.
3. In `src/routes/trading-view/[chain=slug]/tokens/[token]/+page.svelte` (`<svelte:head>` at line 46) and `src/routes/trading-view/[chain=slug]/[exchange]/[pair]/+page.svelte` (line 57), emit `<meta name="robots" content="noindex,follow" />` when the page is not indexable. Use a `$derived` expression so client-side navigation between tokens updates the tag. `follow` keeps link equity flowing to the exchange/chain pages; do not use `nofollow`.
4. Type `TokenDetails` (currently `Record<string, any>` in `src/lib/explorer/token-client.ts`) and the pair summary metrics with at least the fields the helper reads, so the threshold logic is type-checked. Normalise the token address to lowercase in the canonical (workstream 5): `[token]` has no param matcher, so mixed-case addresses route to the same page.
5. ~~Pair URLs are emitted by the backend sitemaps (`api/sitemap/pairs/paged/N.xml`, listed from `src/routes/sitemap.xml/+server.ts`). Open a backend ticket to apply the same thresholds there.~~ Superseded: the pair sitemaps are no longer submitted at all (`.claude/plans/seo-follow-ups.md`, workstream 11). Token pages are not in any sitemap.
6. Do not change what users can reach: the pages stay live, linked and cached exactly as today.

### Verification

- `pnpm run seo:search-console inspect https://tradingstrategy.ai/trading-view/binance/tokens/0xf8001219c6d252eb6c56ea092e14f34b97a1b101` should report `indexingState: BLOCKED_BY_META_TAG` after the next crawl (request re-indexing in the Search Console UI to speed this up).
- Integration test: mock a token with zero liquidity and assert the robots meta is present; mock a token above the threshold and assert it is absent; mock a token with all metrics `null` and assert it is absent. Same for a pair. Add a client-side navigation case (token A → token B) asserting the tag toggles.
- Watch `pnpm run seo:search-console queries` weekly; the adult/gambling names should fall out of the top 30 within a few weeks as pages drop from the index.

### Risk and rollback

- Legitimate new tokens start with low liquidity. The `follow` directive plus internal links mean they are still crawled, and they become indexable automatically once they cross the threshold. A token that was once legitimate but is now permanently illiquid stays excluded indefinitely — that is accepted, since a page with no liquidity and no volume has nothing to offer a searcher.
- Rollback is removing the meta tag, but token and pair pages are edge-cached for 30 minutes with a one-day stale-while-revalidate window (`+page.ts` `cache-control`), so also purge the Cloudflare cache for `/trading-view/*` after deploying either direction.

## Workstream 2 — size the vault sparkline images

Problem 5.2. `src/lib/top-vaults/VaultSparkline.svelte` renders `<img {src} …>` with no intrinsic size; Lighthouse attributes a 0.30 layout-shift score to it on `/vaults`, and the same component is on all 135 indexed `/vaults/*` listing pages. This is the likely cause of the field CLS climbing from 0.04 to 0.09 since late August.

### Changes

1. Add `width` and `height` attributes to the `<img>` matching the sparkline's rendered aspect ratio (check the PNG dimensions served by `vault-sparklines.tradingstrategy.ai`; the CSS `--sparkline-vertical-scale` transform does not affect layout so it can stay).
2. Give `.vault-sparkline` an `aspect-ratio` and `min-height` so the "chart unavailable" fallback and the not-yet-loaded state reserve the same space as the image.
3. Add `loading="lazy"` and `decoding="async"` for rows below the fold (the table can have hundreds of rows).
4. Apply the same to `img.chain-icon` in the strategies filter (`label > div.filter-option > img.chain-icon`, flagged at 0.001) — trivial but it is the other unsized image Lighthouse found.

### Verification

Run PageSpeed Insights on `/vaults` and `/vaults/stablecoins` before and after; the `cls-culprits-insight` entry for `img.svelte-…` in `td.sparkline` must disappear. Field CLS confirmation takes ~4 weeks (28-day CrUX window).

## Workstream 3 — remove render-blocking per-component CSS

Problem 5.1. On every page type the server responds in 5–144 ms but the LCP text renders 0.9–2.5 s later. Lighthouse lists 6–12 small render-blocking stylesheets per page (`Tooltip.css`, `Spinner.css`, `Section.css`, `OptInBanner.css`, `TradingDataInfoRow.css` …) and estimates 300–840 ms of savings. SvelteKit code-splits CSS per component and `svelte.config.js` does not set `kit.inlineStyleThreshold`, so each one is a separate blocking request.

### Changes

1. Set `kit.inlineStyleThreshold` in `svelte.config.js`. The threshold is compared against the **uncompressed** length of each emitted CSS file at build time (`node_modules/@sveltejs/kit/src/exports/vite/build/build_server.js`), not the transfer size Lighthouse reports. Measured on the current production build (`.svelte-kit/output/client/_app/immutable/assets/*.css`, 126 files, 352 KB total):
   - 119 files are under 8 KB uncompressed.
   - The seven large ones are shared chunks that Vite names after one component: `TradingDataInfoRow.css` 39.7 KB (6.7 KB gzipped — this is the file Lighthouse charges ~600 ms on token and vault pages), `0.css` (root layout) 37 KB, `TopVaultsPage.css` 28 KB, then 17 KB, 12.5 KB, 10 KB and 8.7 KB.
     Do this in two steps and measure each:
   - Step A: `inlineStyleThreshold: 8192`. Removes the long tail of small blocking requests (typically 6–10 per page) at a cost of a few KB of HTML per page. Keeps the large shared chunks external and cacheable.
   - Step B (only if step A leaves `render-blocking-insight` savings above ~200 ms): raise to `40_000` so the large chunks inline too. That adds roughly 15 KB gzipped to every document and forfeits cross-page CSS caching, so compare document `transferSize` on `/`, `/vaults` and a token page before and after using the Playwright method in `docs/speed.md`, and keep step B only if LCP improves more than the extra bytes cost on slow 4G.
2. CSP: `kit.csp` in `svelte.config.js` currently sets only `frame-ancestors`, so inlined `<style>` blocks are not blocked. No CSP change is needed; confirm nothing in `docs/security.md` or the Cloudflare edge adds a `style-src`.
3. This is production-build behaviour. The dev server does not inline styles, so verify with `pnpm run build` followed by `pnpm run preview` (sanity check only) and then on the deployed site; checking `grep -c '<style' ` on the served HTML and the absence of the small CSS `<link>` tags is enough.
4. Do not touch the font loading; `font-display` is already correct and `docs/speed.md` documents the deferred `fonts.css` approach.

### Verification

PageSpeed mobile run on each of the seven audit pages after each step: `render-blocking-insight` estimated savings should drop from 300–840 ms to under ~200 ms after step A and near zero after step B, and "Element render delay" in `lcp-breakdown-insight` should shrink accordingly. Confirm no visual regressions on the integration-test screenshots (`pnpm run test:integration`).

## Workstream 4 — route Ghost images through the resize proxy again

Problem 5.3. The home page ships a 1.7 MB PNG blog cover, and blog post covers are 300 KB. Root cause found during the audit: Ghost now serves images from `https://storage.ghost.io/c/<site-id>/content/images/…`, but `getBlogImageUrl` in `src/lib/blog/images.ts` only rewrites URLs that start with `TS_PUBLIC_GHOST_API_URL` (`https://trading-strategy.ghost.io`). Every Ghost image therefore bypasses `/blog/image/…`, and `BlogPostTile.svelte` emits a `srcset` where both candidates are the same original file. The proxy itself works: `/blog/image/content/images/2026/09/<file>.png?w=380&h=380&format=webp` returns 9 KB.

### Changes

1. In `getBlogImageUrl`, also accept `storage.ghost.io` URLs: match the hostname exactly and require the path to contain `/content/images/`; use everything from `/content/` onwards as the proxy path, i.e. `https://storage.ghost.io/c/<id>/content/images/x.png` → `/blog/image/content/images/x.png`. Keep the existing behaviour for `apiUrl`-prefixed URLs and continue returning any other host unchanged.
2. The proxy is `src/routes/blog/image/[...file]/+server.ts`; it builds `new URL(params.file, sourceBaseUrl)` against the Ghost API host and fetches it. The Ghost host answers `301` to `storage.ghost.io`, which `fetch` follows by default and the origin check does not reject, so no proxy change is expected. Add unit tests for `getBlogImageUrl` covering the `storage.ghost.io` form, the `apiUrl` form and an unrelated host, and a proxy test that a mocked upstream 301 followed by an image response still produces a transformed WebP.
3. Dimensions: the Ghost post schema (`src/lib/blog/schemas.ts`) carries no image dimensions, and the proxy resizes with `fit: 'cover'` and `withoutEnlargement: true`, so the requested `w`/`h` are the output size only for source images at least that large. Set the `<img>` `width`/`height` attributes to the requested crop box (the tile already does 380×380 / 760×760) and accept that a smaller-than-requested source is letterboxed by CSS `object-fit`; this keeps the layout stable, which is what matters for CLS.
4. Blog post header image in `src/routes/blog/[slug=slug]/+page.svelte` (`<img src={post.feature_image}>`) — use `getBlogImageUrl` with a `srcset` sized for the article column (it is displayed at ≤ 665 px but served at 1408 px), give it `width`/`height` for a fixed aspect ratio, and mark it `fetchpriority="high"` since it is the LCP element on blog posts.
5. Check `BlogRoll.svelte` and any other `feature_image` consumers (`grep -rn feature_image src`) for the same pattern.

### Verification

The home page `load` (`src/routes/+page.ts`) serialises Ghost post objects into the HTML, so the original `storage.ghost.io` URLs will still appear in the page data even when every rendered image uses the proxy — do not grep the whole document. Instead, with Playwright on the deployed site: assert every `img` inside the blog roll has `src`/`currentSrc` starting with `/blog/image/`, and assert no network request to `storage.ghost.io` is made by the page. PageSpeed `image-delivery-insight` on `/` should drop from ~1.7 MB estimated savings to under 100 KB.

## Workstream 5 — declare canonical URLs on trading-view and glossary pages

Problem 3. URL inspection shows `userCanonical` absent for every token, pair, exchange, chain and glossary page, plus `/about` and `/pricing`. `canonical={pageUrl}` is only passed to `SocialCardMetaTags` / `MetaTags` on home, `/vaults/**`, `/strategies/**` and blog posts.

### Changes

1. Add `<link rel="canonical" href={canonicalUrl} />` to the `<svelte:head>` of:
   - `src/routes/trading-view/[chain=slug]/+page.svelte`
   - `src/routes/trading-view/[chain=slug]/[exchange]/+page.svelte`
   - `src/routes/trading-view/[chain=slug]/[exchange]/[pair]/+page.svelte`
   - `src/routes/trading-view/[chain=slug]/tokens/[token]/+page.svelte`
   - `src/routes/glossary/+page.svelte` and `src/routes/glossary/[slug=glossarySlug]/+page.svelte`
   - `src/routes/about/+page.svelte`, `src/routes/pricing/+page.svelte`
     where `canonicalUrl = page.url.origin + page.url.pathname` (drop the query string — the pair page accepts `?timeBucket=` and the canonical must not vary with it). Add a tiny `$lib/helpers/canonical.ts` helper so the expression is not repeated.
2. Do not add a site-wide fallback in the root layout: pages that already emit a canonical via `svelte-meta-tags` would then have two, which Google treats as none. Verified: the root layout renders `src/lib/header/AppHead.svelte`, which emits no canonical, and none of the routes listed above use `svelte-meta-tags`, so the targeted additions cannot collide.
3. Lowercase the token address in the canonical: `[token]` has no param matcher, so mixed-case addresses route to the same page and could be indexed under several casings.
4. Compute the URL with `$derived` from `page.url` so it updates on client-side navigation between tokens, pairs or glossary terms.

### Verification

`curl -s <url> | grep -o '<link rel="canonical"[^>]*>'` returns exactly one tag on each route above and on a vault page (to prove no duplicate was introduced). Unit-test the helper, and add one integration case that navigates token A → token B client-side and asserts the canonical changed.

## Workstream 6 — stop serialising the whole glossary into every term page

Problem 2. `/glossary/leverage` is 1.15 MB of HTML uncompressed (198 KB on the wire) because `src/routes/glossary/+layout.server.ts` returns the entire glossary from its `load`, and SvelteKit serialises all load data into the page. The term page's universal loader (`[slug=glossarySlug]/+page.ts`) reads `parent().glossary` only to pick one entry, and the page component renders only `entry`. Lab FCP on the term page is 3.8 s with a 71 ms server response. The only consumers of the layout's `glossary` are the index page and that term loader (verified by grep).

### Changes

1. Retire `src/routes/glossary/+layout.server.ts` and `src/routes/glossary/[slug=glossarySlug]/+page.ts` (the universal loader must go, otherwise it keeps running and `parent().glossary` is gone). Replace them with server loads that return only what each page renders:
   - `src/routes/glossary/+page.server.ts`: call `getCachedGlossary`, return the entries reduced to `Pick<GlossaryEntry, 'slug' | 'name'>[]` (the index renders only the name as a link, grouped by first letter — `+page.svelte` lines 9–18), and change the index component's accumulator type from `GlossaryEntry[]` to the picked type. Since the component is touched anyway, migrate it from `export let`/`const { glossary } = data` to runes per CLAUDE.md.
   - `src/routes/glossary/[slug=glossarySlug]/+page.server.ts`: call `getCachedGlossary`, look up the entry with `getGlossaryEntry`, keep the existing `error(404)` and `redirect(301, …)` on slug mismatch, and return only `entry`.
   - Both server loads must preserve the layout's `GlossaryParseError → error(503)` handling and the `cache-control`/`age` headers (`getCachedGlossary.ttl`, `getCachedGlossary.getAge(fetch)`); factor these into a small shared helper in `src/routes/glossary/glossary.ts` rather than duplicating them.
2. If the term page later needs "related terms", return an explicit short list from the server load rather than the whole dictionary.

### Verification

`curl -s https://tradingstrategy.ai/glossary/leverage | wc -c` should fall from ~1.15 MB to well under 100 KB; existing glossary unit tests (`src/routes/glossary/glossary.test.ts`) and the integration specs must pass unchanged, including the slug-redirect and 404 cases. Add an integration case for the 503 path (mock a malformed glossary response) since that logic moves.

Ranking on generic finance terms (`leverage`, `CAGR`, `stop-loss` at positions 56–75) is a content problem, not a frontend one; this workstream only removes the technical penalty.

## Workstream 7 — announcement banner and long-task follow-ups (lower priority)

- Problem 5.5: on pair pages the podcast `AnnouncementBanner` is the LCP element on mobile. Either render it below the page header, cap its height, or defer it until after first paint (render only after `onMount`, with a reserved slot to avoid CLS). Decide after workstream 3 lands, since fixing render-blocking CSS changes what the LCP element is.
- Problem 5.4: the `/vaults` table does up to 10 s of main-thread work in the lab (949 ms long task, 427 ms forced reflow in the Svelte runtime chunk). Profile the `TopVaultsTable` hydration with the Chrome performance panel; likely candidates are per-row `$derived` recomputation and layout reads inside the sort/format helpers. Scope separately once the numbers above are re-measured.
- Problem 6: `/strategies/<id>` pages get 0.15 % CTR at position ~10. Review `strategy.short_description` (used as the meta description in `[strategy=apiStrategy]/+page.svelte`) and the `<title>` for the top strategies; this is content work.
- Problem 4: `/trading-view/vaults*` and `/trading-view` already return 301s and are no longer in `sitemap-static.xml` or linked from frontend source. The remaining referrers are the docs site and glossary content; report those to their owners. Also ask the backend team about the `?version=2` suffix on the registered vault sitemap URL and the 37 warnings on `glossary/sitemap.xml`.

## Out of scope

- Search Console URL-group Core Web Vitals (only in the UI; not automatable).
- `/docs/*` pages (Sphinx site, separate repository).
- Backend sitemap generation for pairs and exchanges (ticket only).

## Rollout order and measurement

1. Baseline capture.
2. Workstreams 2 and 4 (small, isolated, measurable within a day in lab data).
3. Workstream 1 (largest search-footprint effect; needs a few weeks to show in Search Console).
4. Workstream 3 (site-wide, needs screenshot regression check).
5. Workstreams 5 and 6.
6. Re-run the audit commands from `docs/google-webmasters.md` and append a dated follow-up section to that document.
