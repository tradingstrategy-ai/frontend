# SEO round 3 — index hygiene, crawl waste, font CLS, blog embeds, metadata

## Status (2026-09-17)

Implemented on branch `seo-round-3` (all eight workstreams; outcomes and the dry-run numbers are in `docs/google-webmasters.md`, "Round 3 — 2026-09-17"). Deviations from the plan: the `X-Robots-Tag` and font `Link` headers are set by one `handleResponseHeaders` hook instead of per-endpoint code; the unknown-protocol rule excludes only vaults whose _current_ TVL is confirmed below the threshold (896 of them; every one has a peak above it), the `media="print"` font-stylesheet measurement was deferred, breadcrumbs on vault pages are JSON-LD rather than the visible component (no design change), and the two infrastructure steps (Cloudflare purge of `/social-card/*` + `/metadata-logo/*`, cache rules for `/fonts/*.woff2` and `/avatars/*`) remain to be done after deploy. Originally: planned; not started. Based on the live-site audit of 17 September 2026 run after PRs #1435–#1438 shipped (PageSpeed Insights API mobile runs on six templates, Search Console UI and API, and the SSR HTML of ~25 page types). Findings and figures below are from that audit; Search Console data still ends 2026-09-14, so the effect of the previous rounds is not visible in it yet. Reviewed twice by Codex (gpt-5.6-sol) on 2026-09-17; both passes' findings are folded in below.

## Goal

Third round of search-experience work after `.claude/plans/seo-and-core-web-vitals.md` and `.claude/plans/seo-follow-ups.md`. Eight workstreams ordered by value per effort. Each is independently shippable; 1–2 are index hygiene and should ship first as one PR, 3–5 are performance and can be a second PR, 6–8 are metadata and can follow.

Success criteria, checked with `pnpm run seo:cwv --history`, `pnpm run seo:search-console pages|queries|inspect` and the Search Console UI:

- Vault pages below the quality threshold return `noindex,follow` and are absent from `vaults/sitemap.xml`; the number of **indexed** vault URLs stays within 10 % of today's while the "Crawled – currently not indexed" bucket (35K URLs on 2026-09-14) falls at the next recrawl. Measure indexed counts and crawl demand, not the disappearance of URLs from reports — `noindex` URLs reappear under "Excluded by noindex".
- No `/social-card/*` or `/metadata-logo/*` URL is indexed; they leave the "Crawled – currently not indexed" bucket (they will show under "Excluded by noindex", which is the intended state).
- "Duplicate without user-selected canonical" (549 URLs, almost all `/trading-view/<chain>/<0xaddress>/export-data`) trends to zero.
- Lab CLS on `/glossary/<term>` below 0.05 (0.25 today, all font swaps); no `Web font` entry in `cls-culprits-insight`.
- Blog post lab LCP under 4 s (16.7 s today) and no request to `youtube.com`, `doubleclick.net` or `googleapis.com` before user interaction (a poster image from `i.ytimg.com` is acceptable).
- Font files served with a one-year `Cache-Control`; logos and avatars with at least one day.
- Every indexable page in `sitemap-static.xml` and the dynamic templates listed in workstream 6 has a title with the brand suffix, a description of 70–155 characters and an `og:image`.

## Workstream 1 — stop indexing dead vault pages

`src/routes/vaults/sitemap.xml/+server.ts` lists every non-blacklisted vault (4,681 detail URLs on 2026-09-17). A random sample of 60 detail pages: 28 had TVL under $5,000, 9 had TVL $0, 21 were on "Unknown vault protocol", and some are titled `<unnamed> | DeFi vault | Trading Strategy` with description `<unnamed> on Unknown vault protocol on Ethereum | TVL: $0 | 1M return: 0.0%`. All of them are `index,follow`. Vault pages are the only template with a healthy CTR (3.4 %), so the good ones must stay; the empty ones are the same problem the token pages had.

`current_nav` and `peak_nav` are **denomination-token amounts, not USD** (`src/lib/top-vaults/schemas.ts:327-333`). The USD conversions already exist: `getVaultCurrentTvlUsd()` and `getVaultPeakTvlUsd()` in `src/lib/top-vaults/helpers.ts:598-617`, which need the vault to carry a denomination rate (`withVaultDenominationTokenRate()`, applied in the detail loader from the stablecoin metadata index). The sitemap endpoint already fetches `stablecoinIndex`, so it can apply the same rate before deciding.

### Changes

1. Add `isVaultIndexable(vault)` in `src/lib/explorer/indexing.ts` alongside `isTokenIndexable`, reusing `INDEXABLE_MIN_LIQUIDITY_USD` and `hasBlockedName`. It takes the USD TVL values, not the raw NAV, so callers pass `getVaultCurrentTvlUsd(vault)` / `getVaultPeakTvlUsd(vault)` (both `null` when there is no rate). Not indexable when any of:
   - `isBlacklisted(vault)`
   - current TVL USD is a confirmed number below $5,000 **and** peak TVL USD is also a confirmed number below $5,000 (a vault that once held real money keeps its page; `null` on either side keeps the page indexable, matching the token rule — this means named vaults with no NAV data or no USD rate stay indexed, deliberately)
   - `isUnknownVaultProtocol(vault)` **and** current TVL USD is below $5,000 or `null` (an unknown-protocol vault with real TVL keeps its page; the dry run in item 6 decides whether this branch needs a higher bar)
   - the name is blank or starts with `<` (the `<unnamed>` placeholder)
   - `hasBlockedName([vault.name])`
2. `src/routes/vaults/[vault=slug]/+page.server.ts` returns `robots: isVaultIndexable(…) ? undefined : 'noindex,follow'` computed on `vaultWithRates`; `AppHead.svelte` already emits it.
3. `sitemap.xml/+server.ts`: apply `withVaultDenominationTokenRate` (with `getCurrencyUsdRates(stablecoinIndex)`) to each listed vault and filter the detail-page loop with `isVaultIndexable`; drop `/vaults/protocols/unknown` and remove `'blacklisted'` from `staticSubPages` (line 16) so no submitted URL is `noindex`. Do **not** add `lastmod`: `generated_at` changes on every dataset regeneration and `last_updated_at` (schemas.ts:391) reflects the collector, not a content change — a `lastmod` that moves on every page teaches Google to ignore it.
4. `noindex` the `/vaults/protocols/unknown` and `/vaults/blacklisted` listing pages (`+page.server.ts` of those routes).
5. Tests: unit tests for `isVaultIndexable` covering each exclusion reason, the $5,000 boundary (exactly $5,000 is indexable), low current / high peak, `null` current, `null` peak, no USD rate (→ indexable), unknown protocol with real TVL (→ indexable). Extend `tests/integration/sitemap-index.test.ts` (the existing vault sitemap suite, line ~55) with a mocked `$0` unknown-protocol vault absent from the sitemap, `/vaults/blacklisted` absent, and a page-level assertion of `noindex` on that vault's detail page.
6. Dry run before merging, **stratified by reason**: with the real dataset, count vaults excluded by (a) TVL, (b) unknown protocol, (c) placeholder name, (d) blocklist, and list the ten highest-TVL vaults hit by (b) and the number of null-NAV vaults left indexable. Record the numbers in `docs/google-webmasters.md`. Expect roughly half excluded overall. If more than 70 % are excluded, lower the TVL bar rather than ship — the point is to drop empty pages, not thin the catalogue.

### Verification

`pnpm run seo:search-console inspect <url>` on two dropped pages shows "Excluded by noindex" after recrawl; the sitemap URL count in Search Console drops accordingly; indexed vault URLs (Search Console "View data about indexed pages", filtered to `/vaults/`) do not fall by more than the excluded set. Do not submit removals for these — they are not harmful, just thin.

## Workstream 2 — crawl waste: image endpoints, export-data pages, unknown exchanges

A 1,000-URL sample of the "Crawled – currently not indexed" bucket (Search Console UI, 2026-09-17): **440 `/social-card/...`** (og:image endpoints, many with `?fallback=…` query strings), **13 `/metadata-logo/...`**, 161 + 30 on the `web3-ethereum-defi` docs subdomain, 80 `/docsapi/...` (see note), 59 token pages, 46 pair pages, 21 exchange pages. Separately, the 549 "Duplicate without user-selected canonical" URLs are `/trading-view/<chain>/<0xaddress>/export-data` — exchanges the backend has no name for (`human_readable_name` is `"Unknown"` or `"Unknown 0x…"`, slug = contract address), whose export pages all render the same title.

### Changes

1. `X-Robots-Tag: noindex` on every response from `src/lib/social-card/render.ts` (`socialCardResponse`, line 53), from `src/routes/metadata-logo/[kind=metadataLogoKind]/[slug]/+server.ts`, **and** on the responses `src/routes/social-card/vault/[id]/+server.ts` builds itself — the proxied sparkline PNG (lines 83–90) and the two `redirect(302, fallbackUrl)` paths (lines 76, 96), which are the `?fallback=…` URLs that dominate the audit sample. Put the header in one helper (`withNoindexHeader(response)` / a headers constant) so no branch is missed; for the redirects use `new Response(null, { status: 302, headers: { location, 'x-robots-tag': 'noindex' } })` since SvelteKit's `redirect()` cannot carry headers. Images cannot carry a meta tag; the header is the only way. This also removes them from Google Images — accepted: generated social cards and protocol logos have no image-search value. Do **not** block them in `robots.txt` — social scrapers and Google's own og:image fetch must still be able to read them. Successful social cards are cached `public, max-age=31536000, immutable`, so **purge `/social-card/*` and `/metadata-logo/*` at Cloudflare after deploy**, otherwise edge copies keep serving without the header for a year.
2. `src/routes/trading-view/[chain=slug]/[exchange]/export-data/+page.ts` currently re-exports the exchange loader; wrap it so it also returns `robots: 'noindex,follow'`. The export page is a download utility, not a search target.
3. Add `isUnknownExchangeName(name)` to `src/lib/helpers/exchange.ts` matching both `"Unknown"` and `"Unknown 0x…"`; use it in `src/routes/trading-view/[chain=slug]/[exchange]/+page.ts` to return `robots: 'noindex,follow'`, and replace the inline `startsWith('Unknown 0x')` filter in `src/routes/trading-view/[chain=slug]/+page.server.ts:48` with it. Keep the pair pages under them governed by `isPairIndexable` as today.
   The exchange sitemap is served by the backend (`api/sitemap/exchanges/sitemap.xml`, listed in `src/routes/sitemap.xml/+server.ts:25`) and includes these exchanges. Ask the backend to exclude unknown-named exchanges; until it does, Search Console will report "Submitted URL marked noindex" for them — accept the warning rather than dropping the whole exchange sitemap (the named exchanges are legitimate).
4. `src/lib/components/MenuItem.svelte:7` drops the `href` when `active` (`$: href = active ? undefined : targetUrl`), so `/vaults` renders `<a class="…">Top vaults</a>`; keep the `href` and set `aria-current="page"` instead, moving the `&:not([href])` styling at line 36 to `&[aria-current]`. The component is still Svelte 4 syntax — convert to runes while touching it, per `CLAUDE.md`. Lighthouse's `crawlable-anchors` audit fails on it today; cosmetic for SEO but a free fix.
5. Out of this repository, record in `docs/google-webmasters.md` for whoever owns them:
   - `https://tradingstrategy.ai/docsapi/…` serves the Sphinx page for `/docs/api/…` with the right canonical (the docs proxy accepts `/docs<anything>`); something links with the missing slash. Not harmful, wastes crawl.
   - The production `/blog` index page has **no canonical link** although the same build renders it locally (`AppHead` output on production is missing exactly the `<link rel="canonical">` line; icons and RSS link are present). Nothing in this repo differs for that path; check the proxy-server / Cloudflare rules for a `/blog` rewrite that strips it. Every other page checked, including blog posts, has the canonical.
6. `src/routes/sitemap-static.xml/+server.ts:12` submits `docs`, which 302s to `/docs/` (the only non-200 URL in that sitemap); the docs site has its own sitemap in the index, so drop the entry.
7. Tests: response-header assertions for both image endpoints (unit tests on `socialCardResponse` and the logo endpoint), `robots` on the export page and on an `Unknown 0x…` exchange page in the integration suite (extend `tests/mocks` with an unknown-named exchange), and a `MenuItem` unit test asserting the active item keeps `href` and carries `aria-current`.

### Verification

`curl -sI https://tradingstrategy.ai/social-card/trading-strategy | grep -i x-robots` (after the purge); `pnpm run seo:search-console inspect` on an export-data URL reports the noindex. The 549 duplicates and the social-card examples move out of their current buckets over the following weeks.

## Workstream 3 — web-font swap is the remaining CLS source

PSI on `/glossary/hyperliquid-provider-vault`: CLS **0.253**, with `cls-culprits-insight` naming only "Web font" causes (Neue Haas Grotesk Text 55/65/75, Display 65, Source Code Pro). The earlier plan (`seo-follow-ups.md`, workstream 1 item 4) stated the fallbacks were size-adjusted; they are not — `grep size-adjust static src` finds nothing, `static/fonts/fonts5.css` has 30 `@font-face` rules all `font-display: swap`, and `docs/speed.md`'s "mobile font cheat" section describes a mechanism that no longer exists. `fonts5.css` is loaded with the `media="print"` trick (`src/app.html:13`), so in the lab the woff2 requests start at ~2.1 s and every text-heavy page reflows when they land. `hooks.server.ts` already sends `Link: rel=preload` headers for the three primary faces, but only on `/` and `/vaults/<slug>`, and `handleFontPreload` (line ~132) appends the header to **every** response, including sitemaps, JSON and images.

### Changes

1. Metric-matched fallback faces. Generate `size-adjust`, `ascent-override`, `descent-override` and `line-gap-override` for each family against its system fallback (`fontaine` or `@capsizecss/metrics` can compute them from the woff2 files; the values are static so commit the output, do not add a build step). Add `@font-face { font-family: 'Neue Haas Grotesk Text Fallback'; src: local('Arial'); size-adjust: …; … }` etc. and put the fallback names into **every** font stack: `--ff-display`, `--ff-ui`, `--ff-text`, `--ff-mono` in `src/lib/components/css/typography.css:3-6` and the `.ds-3` overrides `--ff-article`, `--ff-heading`, `--ff-paragraph`, `--ff-ui`, `--ff-mono` in `src/lib/components/css/typography-new.css:1-7`. This removes the reflow regardless of when the font arrives. One fallback per family, matching its class: sans (`Neue Haas Grotesk Display` / `Text`) → `local('Arial'), local('Roboto'), local('Helvetica Neue')`, serif (`Source Serif Pro`, `--ff-text` / `--ff-article`) → `local('Georgia'), local('Times New Roman')`, mono (`Source Code Pro`) → `local('Menlo'), local('Consolas'), local('Courier New')`; compute the overrides against the first face in each chain, and per weight where the metrics differ materially (Display 65 vs 75). Fallback metrics differ per platform, so the residual mismatch on Android is not zero — but far smaller than today's unadjusted swap.
2. The stylesheet changes, so it gets a new URL: `fonts5.css` → `fonts6.css` in `src/app.html:13-14`, `src/hooks.server.ts:116`, `scripts/setup-fonts.sh:21` (it reads the stylesheet to know which files to sync) and `static/fonts/README.md`. This is what lets workstream 5 give `/fonts/*` a long cache lifetime. While rewriting it, drop the faces nothing uses: every typography token in `typography.css` / `typography-new.css` uses Display at 400–700 (plus three ad-hoc `font-weight: 900` rules), so the Display 100, 200 and 300 faces and their italics (`NeueHaasGroteskDisplay/15, 16, 25, 26, 35, 36.woff2`) are dead — remove the six `@font-face` blocks and the files (they are synced from the companion fonts repo, not committed; `setup-fonts.sh` only syncs what the stylesheet references).
3. `handleFontPreload`: only append `Link` when the response `content-type` is `text/html`; extend the per-template face list to the templates that show the CLS (glossary term, token, pair, blog post) rather than making it global — three unconditional font preloads would compete with the hero and blog cover images for bandwidth on the pages where those are the LCP element.
4. Measure whether the `media="print"` trick still pays: with metric-matched fallbacks, a render-blocking `<link rel="stylesheet" href="/fonts/fonts6.css">` (2 KB, already preloaded) makes the swap earlier without any CLS. PSI cannot test an unpublished branch, so compare with local Lighthouse runs (`pnpm run build`, `pnpm run preview`, `npx lighthouse --preset=perf --form-factor=mobile --throttling-method=simulate`) — three runs each way on a glossary page and a token page; keep whichever has the lower median LCP.
5. `docs/speed.md`: the "Mobile font cheat" section describes a mechanism that no longer exists and points at `/static/fonts.css`, which does not exist; the "Analyzing vendor.js bundle" section refers to `svelte-kit build` and a `vendor-*.js` chunk from the SvelteKit 1 era. Replace the font section with the actual mechanism (deferred stylesheet + preload + metric-matched fallbacks) and delete or update the bundle section (`pnpm run build` + `source-map-explorer build/client/_app/immutable/chunks/*.js`). Also correct `.claude/plans/seo-follow-ups.md` workstream 1 item 4, which claims the fallbacks are already size-adjusted.
6. Tests: extend `tests/integration/layout-shift.test.ts` with a glossary page and delay `*.woff2` responses with `page.route` (fonts are served locally and would otherwise arrive before first paint, so the observer never sees a swap); assert CLS < 0.05. Add an integration assertion that the font `Link` header is present on an HTML page and absent on `sitemap.xml` and a `/social-card/*` response.

### Verification

`cls-culprits-insight` on the glossary page has no "Web font" entry and total CLS < 0.05 (PSI after release). Field CLS via `pnpm run seo:cwv --history` after 28 days.

## Workstream 4 — blog post embeds and metadata

PSI on `/blog/episode-12-atoma` (mobile): LCP **16.7 s**, FCP 11.6 s, 131 requests, 2.5 MB; the YouTube player (`base.js` 473 KB ×2, `ytembeds` 220 KB ×2, `www-player.css`, doubleclick, `jnn-pa.googleapis.com`) loads before the cover image paints. The Ghost HTML contains one `<iframe src="https://www.youtube.com/embed/…">` with no `loading` attribute. Every player resource appears twice in the network log; the cause is not established (Svelte 5 hydrates `{@html}` by adopting the SSR nodes, so it is not a hydration re-render — measure it, do not assume). The post's `<meta name="description">` is **500 characters** (Google shows ~155). The JSON-LD is emitted by `<JsonLd>` in `src/routes/blog/[slug=slug]/SocialMetaTags.svelte:45-57` — `NewsArticle` with `author: { "@type": "Person", "name": "Trading Strategy" }` and no `image`, `publisher`, `url` or `mainEntityOfPage`. It is valid and eligible for the Article feature (Google has no required properties), but the author is wrong and the image is the main recommended field. `serializePost()` in `src/lib/helpers/google-meta.ts` is dead code — nothing calls it.

### Changes

1. Server-side transform of the Ghost post body. Today `src/routes/blog/[slug=slug]/+page.server.ts` returns `post.html` untouched (only the cover image goes through `src/lib/blog/images.ts`). Add `transformPostHtml(html)` in `src/lib/blog/` and call it from the loader: replace `<iframe … src="https://www.youtube.com/embed/<id>…">` (also `youtube-nocookie.com`; tolerate attribute order, quoting and query strings) with a facade — a `<a href="https://www.youtube.com/watch?v=<id>" class="youtube-facade" data-video-id="<id>">` inside a wrapper with a fixed `aspect-ratio: 16 / 9`, containing the `https://i.ytimg.com/vi/<id>/hqdefault.jpg` poster (4:3, so `object-fit: cover`, `width`/`height`, `loading="lazy"`) and a play button. `BlogPostContent.svelte` gets a delegated click/keyboard handler that swaps the facade for the real `<iframe … autoplay=1 title="…">` inside the same 16:9 box, so nothing shifts. Any other `<iframe>` (Spotify, Apple Podcasts) gets `loading="lazy"`. The site's CSP only sets `frame-ancestors` (`svelte.config.js`), so no `img-src` change is needed. Use a regex on the `<iframe …>` tag, not an HTML parser — the input is Ghost's own markup; unit-test the transform against a Ghost fixture including the nocookie host and an iframe with attributes before `src`.
2. Truncate the `<meta name="description">` to 155 characters on a word boundary in `SocialMetaTags.svelte` (`og:description` can keep the longer text).
3. Replace the `NewsArticle` block in `SocialMetaTags.svelte` with `BlogPosting` — `headline`, `image` (the cover via `/blog/image/`), `url`, `mainEntityOfPage`, `datePublished`/`dateModified`, `author` and `publisher` both the `Organization` (with the `@id` shared with workstream 7's home-page `Organization`). Always `BlogPosting`, never `PodcastEpisode` in its place — only `Article`/`NewsArticle`/`BlogPosting` are eligible for the Article feature. Podcast detection would need Ghost tags (`include=tags` in `src/lib/blog/client.ts:20`, a tag schema in `src/lib/blog/schemas.ts`), which is out of scope; a linked `PodcastEpisode` entity can come later. Delete the unused `serializePost` and its `Post` interface from `google-meta.ts` (`serializeSchema` and `sitelinksSearchBox` stay — the glossary and home page use them).
4. Blog index `/blog`: description is 41 characters ("Research in DeFi and algorithmic trading."); write a real one and add the brand suffix to the title (see workstream 6).
5. Tests: there is no deterministic blog fixture in the integration harness (`tests/e2e/blog.test.ts` is a smoke test against production). Add a mocked Ghost post response to `tests/mocks` and an integration test that asserts no request to a YouTube player domain before interaction, then exactly one iframe with the 16:9 wrapper after pointer and keyboard activation. Unit-test `transformPostHtml` and the description truncation.

### Verification

PSI mobile on the same post: no player request before interaction, LCP under 4 s; Rich Results Test (`search.google.com/test/rich-results`) reports a valid BlogPosting with image and Organization publisher.

## Workstream 5 — long-lived caching for fonts, avatars and logos

`/fonts/*` and `/avatars/*` are files under `static/`, served by adapter-node's sirv **before** the SvelteKit handle runs (so `hooks.server.ts` cannot set their headers), and arrive with `cache-control: max-age=14400` — Cloudflare's default when the origin sends nothing. `/logos/**` is **not** static: it is `src/routes/logos/[type=logoType]/[slug]/+server.ts`, which sets no cache header today. PSI's `cache-insight` charges 92–1,148 KB per page to these. `_app/immutable/*` is already `max-age=31536000, immutable`.

### Changes

1. `/logos/**`: set `cache-control: public, max-age=604800, stale-while-revalidate=86400` (seven days) in the endpoint. Logo URLs are keyed by slug, not content, and are not all produced by `getLogoUrl()` (`src/lib/helpers/assets.ts:6`) — the trade-executor vault adapters hard-code `/logos/...` paths (`src/lib/trade-executor/vaults/{enzyme,hyperliquid,hot_wallet,lagoon,velvet}/index.ts`), so a version parameter on the helper alone would not make a one-year `immutable` TTL safe. Seven days removes the Lighthouse finding; revisit one-year caching only if every producer goes through a versioned helper.
2. `/fonts/*.woff2`: Cloudflare Cache Rule with Edge and Browser TTL of one year. The woff2 files never change in place; the stylesheet does, which is why workstream 3 renames it to `fonts6.css` — the rule must match `*.woff2` only, or `fonts*.css` must be excluded, otherwise a future stylesheet edit is invisible for a year. **Do not enable this rule before the `fonts6.css` rename is live.**
3. `/avatars/*`: unversioned and occasionally replaced; a Cloudflare rule with a one-day browser TTL and seven-day edge TTL is the safe choice. Going to a year requires versioned file names.
4. Document the rules in `docs/google-webmasters.md` (they are infrastructure, not code).
5. `vault-sparklines.tradingstrategy.ai` images are regenerated daily; the 4-hour default is right — leave them.

### Verification

`curl -sI https://tradingstrategy.ai/fonts/NeueHaasGroteskText/55.woff2 | grep -i cache-control` shows the one-year value and `/logos/...` the seven-day one; `cache-insight` in PSI no longer lists fonts or logos.

## Workstream 6 — titles, descriptions and social images across templates

Measured on 2026-09-17 from the SSR HTML:

| Page          | Title (chars)                                      | Description (chars) | `og:image` |
| ------------- | -------------------------------------------------- | ------------------- | ---------- |
| `/`           | `Trading Strategy` (16)                            | 36                  | yes        |
| `/vaults`     | `Top stablecoin vaults` (21)                       | 73                  | yes        |
| `/strategies` | `Trading Strategy vaults \| Trading Strategy` (44) | 165                 | yes        |
| `/about`      | `About Us` (8)                                     | 31                  | no         |
| `/blog`       | `Trading Strategy Blog` (21)                       | 41                  | no         |
| `/glossary`   | `DeFi and trading dictionary` (27)                 | 47                  | no         |
| token page    | `WETH on Ethereum` (16)                            | 39                  | no         |
| pair page     | `ETH-USDC (0.05%) token price on Uniswap v3` (42)  | 58                  | no         |
| exchange page | `Uniswap v3 on Ethereum` (22)                      | 55                  | no         |
| chain page    | `Ethereum decentralised exchanges and …` (50)      | 95                  | no         |
| vault page    | `<name> \| DeFi vault \| Trading Strategy`         | 75                  | yes        |
| blog post     | `Episode #12: Atoma` (18)                          | 500                 | yes        |

The brand suffix and the social image are only present on the templates that go through `SocialCardMetaTags`; the others write `<title>` directly in `<svelte:head>` — 48 such blocks across `src/routes`.

### Changes

1. One helper, `getPageTitle(parts: string[])` in `src/lib/helpers/seo.ts` (move `src/lib/strategies/seo.ts` there or re-export), that joins with `|` and appends `Trading Strategy` unless the result would exceed ~60 characters, in which case it drops the least important part first.
2. Home page (`src/routes/+page.svelte:22-23`): title along the lines of `DeFi vault rankings, yields and risk data | Trading Strategy`; description 120–155 characters that names what the site does (vault comparison, 3,000+ vaults, on-chain data). The `<h1>` can stay.
3. Inventory first: list the 48 `<title>` blocks, mark each route indexable or not (from `sitemap-static.xml` and the dynamic sitemaps), and migrate exactly the indexable ones. At minimum: token, pair, exchange, chain, glossary index and term, about, blog index, blog post, `/vaults` and its listing pages, the podcast page, `/datasets`, the trading-view index pages. Each gets `SocialCardMetaTags` with the default `/social-card/trading-strategy` image (or `/social-card/blockchain/<slug>` on chain pages, which already exists), a title through the helper, and a description of 70–155 characters built from the page's data (token: symbol, chain, price/TVL/volume; pair: pair, exchange, chain, 24 h volume; glossary: the first sentence of the definition, padded with the term's category when short).
4. Blog post description: workstream 4 item 2.
5. Tests: extend `tests/integration/canonical.test.ts` (rename to `head-meta.test.ts`) to cover `/`, `/vaults`, a vault page, `/strategies`, a strategy page, chain, exchange, pair, token, `/glossary`, a glossary term, `/about`, `/blog` and a blog post (mocked, from workstream 4): exactly one `<title>` ending in `Trading Strategy`, one description of 70–155 characters, one `og:image`.

### Verification

Search Console, 4–6 weeks after release: CTR on the token/pair/glossary templates compared with the 28-day baseline (0.42 %, 1.11 %, 0.24 %). This is the workstream with the least certain payoff; keep it after 1–5.

## Workstream 7 — structured data

Present today: `WebSite` + `SearchAction` on `/`, `CollectionPage` on vault listings, `InvestmentFund` on vault pages, `FAQPage` on glossary terms (Google stopped showing FAQ rich results for non-government/health sites in 2023; harmless but earns nothing), `NewsArticle` on blog posts (workstream 4), and **microdata `BreadcrumbList`** from `src/lib/breadcrumb/Breadcrumbs.svelte:49-54` — that is where the Search Console Breadcrumbs report's 414 valid items come from. The component is used on trading-view, glossary term, blog post and strategy routes but **not** on vault detail or vault listing pages.

### Changes

1. `Organization` JSON-LD on the home page with a stable `@id` (`https://tradingstrategy.ai/#organization`), `name`, `url`, `logo` (an indexable PNG/SVG of at least 112×112 — the existing 100×100 PNG does not qualify; add a 512×512 asset under `static/`), `sameAs` for X, GitHub, Discord, YouTube and the podcast. The blog `BlogPosting.publisher` (workstream 4) references the same `@id`.
2. Breadcrumbs: do **not** add a second JSON-LD `BreadcrumbList` next to the microdata — one entity per page. Either keep microdata and simply add the `Breadcrumbs` component to the vault detail and listing pages, or convert the component to emit JSON-LD from its existing derived items and drop the `itemscope` attributes; the first is less work and keeps the 414 valid items valid. Item URLs must be absolute in whichever form is kept.
3. Glossary: `DefinedTerm` inside a `DefinedTermSet` alongside the existing `FAQPage` (they are not exclusive). Low priority; do only if 1–2 are quick.
4. Validate each type with the Rich Results Test and `validator.schema.org` before merging; unit-test each serialiser and assert exactly one breadcrumb entity per page in the head-meta integration test.

## Workstream 8 — small Lighthouse items

1. `src/app.html:5`: drop `maximum-scale=1` from the viewport meta. It fails the `meta-viewport` accessibility audit on every page and blocks pinch zoom for users; SvelteKit does not need it.
2. Home hero: the LCP element is `section.home-hero-banner > div.inner`, painted with a CSS `background-image` from a custom property (`HomeHeroBanner.svelte:16`), so the browser discovers the image only after CSS and style resolution — PSI shows a 2.5 s "resource load delay" before the 27 KB webp even starts. Add `<link rel="preload" as="image" href={heroBackgroundMobile} media="(max-width: …)">` and the desktop counterpart with the complementary media query in the home page's `<svelte:head>` (imports give the hashed URLs; the two media queries must be mutually exclusive so only one image is fetched — assert that in an SSR test), or render the hero as an `<img fetchpriority="high">` positioned behind the content.
3. `src/lib/trade-executor/components/StrategyIcon.svelte` renders the `avatars/*.webp` strategy icons (`alt="Strategy icon"`) without `width`/`height`; add them (the rendered size is fixed by CSS, so the intrinsic attributes only need to match the aspect ratio) and convert the component from `export let` to runes while touching it. Component test for the attributes.
4. Console error on `/vaults` in the lab (one 404 resource): diagnosis item, not yet an implementation item — identify the URL from a fresh PSI network log first, then decide the fix and owner.
5. Colour contrast of the footer disclaimer (`.disclaimer`, 2.61:1) is an accessibility finding, not SEO; note it for the design owner.

## Dead code and stale docs removed along the way

Each item is owned by the workstream that touches the file, so nothing is a separate PR; listed here so none is forgotten.

| Item                                                                                                                                                | Workstream |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| `serializePost()` + `Post` interface in `src/lib/helpers/google-meta.ts` — no callers; the blog JSON-LD is built inline                             | 4          |
| Six unused Neue Haas Display faces (100/200/300 + italics) in `fonts5.css` and their woff2 files                                                    | 3          |
| `docs/speed.md` "Mobile font cheat" (describes a removed mechanism, cites non-existent `/static/fonts.css`) and the SvelteKit 1 bundle section      | 3          |
| `.claude/plans/seo-follow-ups.md` claim that font fallbacks are size-adjusted                                                                       | 3          |
| `src/lib/components/MenuItem.svelte` `&:not([href])` active-state rule (replaced by `[aria-current]`) and its Svelte 4 syntax                       | 2          |
| `src/lib/trade-executor/components/StrategyIcon.svelte` Svelte 4 `export let` syntax                                                                | 8          |
| `'docs'` entry in `sitemap-static.xml` (302s; the docs site has its own sitemap)                                                                    | 2          |
| `NewsArticle` block in `src/routes/blog/[slug=slug]/SocialMetaTags.svelte` (replaced by `BlogPosting`)                                              | 4          |
| Per-route font preload lists in `hooks.server.ts` if item 3.3 replaces them with a template map — remove the old constants, not just the call sites | 3          |
| `tests/integration/canonical.test.ts` — renamed/absorbed into `head-meta.test.ts`, not duplicated                                                   | 6          |

Checked and **not** dead (leave alone): `src/routes/trading-view/vaults/**` legacy redirects (Google still requests them — 4,522 "page with redirect" URLs), the three Search Console / IndexNow verification `.txt` files under `static/`, `static/brand-mark-100x100.png` (used as the wallet-connect icon in `src/lib/wallet/client.ts:24`; workstream 7 adds a larger logo rather than replacing it), `src/lib/social-card/*` and `src/lib/blog/images.ts` (all exports have callers), `hasBlockedName` and `truncateAtWord` (exported for tests and reused by workstreams 1 and 6).

## Not in this plan

- Backlinks (775 external links, mostly GitHub/Reddit/PyPI) — content and outreach, no code.
- The `web3-ethereum-defi` and Sphinx docs subdomains' crawl issues (~25 % of the not-indexed sample) — other repositories.
- Glossary content depth for generic finance terms — docs repository, as decided in round 2.
- `inlineStyleThreshold` tuning — still waiting on the LCP fix validation started 2026-09-16.
- Podcast-specific structured data (needs Ghost tags in the schema first).

## Order of work

1. Workstreams 1 + 2 in one PR (`feat: noindex empty vault pages and crawl-waste endpoints`); changelog entry; Cloudflare purge of `/social-card/*` and `/metadata-logo/*` right after deploy.
2. Workstreams 3 + 4 + 5 as the performance PR. The Cloudflare font cache rule (5.2) goes live only after the `fonts6.css` rename (3.2) is deployed; the logo endpoint header (5.1) ships with the PR.
3. Workstreams 6 + 7 + 8 as the metadata PR, after the title inventory (6.3) has fixed its scope.
4. After each release, append the measured before/after to `docs/google-webmasters.md` under a "Round 3 — <date>" heading, as the previous rounds did.
