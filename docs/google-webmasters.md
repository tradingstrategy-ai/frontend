# Google Search Console and Core Web Vitals access

The frontend has two dependency-free CLI scripts for pulling SEO and performance data from Google without opening the Search Console UI:

| Script                                                                  | Command                                 | Data source                                                     |
| ----------------------------------------------------------------------- | --------------------------------------- | --------------------------------------------------------------- |
| [`scripts/seo-core-web-vitals.mjs`](../scripts/seo-core-web-vitals.mjs) | `pnpm run seo:cwv`                      | Chrome UX Report (CrUX) API — real-user Core Web Vitals         |
| [`scripts/seo-search-console.mjs`](../scripts/seo-search-console.mjs)   | `pnpm run seo:search-console <command>` | Search Console API — search analytics, sitemaps, URL inspection |

Both scripts load `.env.local` through Node's built-in `--env-file` flag, so no extra packages are needed.

## Why two different credentials

Search Console's **Core Web Vitals report is not exposed by the Search Console API**. The report is built from the Chrome UX Report (the "Source: Chrome UX report" note at the top of the report page), so field CWV data has to be fetched from the CrUX API instead. The CrUX API is public and only needs an API key.

Everything else in Search Console (search performance, sitemaps, index coverage, URL inspection) is private property data and requires an authenticated identity that has been granted access to the property. A service account is used for this so scripts can run without an interactive OAuth flow.

| Need                                       | API                    | Credential      |
| ------------------------------------------ | ---------------------- | --------------- |
| Core Web Vitals (LCP, INP, CLS, FCP, TTFB) | Chrome UX Report API   | API key         |
| Lab performance audits                     | PageSpeed Insights API | Same API key    |
| Clicks, impressions, queries, pages        | Search Console API     | Service account |
| Sitemap status, URL inspection             | Search Console API     | Service account |

## Environment variables

Add to `.env.local` (gitignored):

```env
# API key restricted to the Chrome UX Report + PageSpeed Insights APIs
TS_PRIVATE_GOOGLE_CRUX_API_KEY="<api-key>"

# Absolute path to the service account JSON key, kept outside the source tree
TS_PRIVATE_GOOGLE_SERVICE_ACCOUNT_FILE="/Users/<you>/.tradingstrategy/google-service-account.json"

# Search Console property (optional, this is the default)
TS_PRIVATE_SEARCH_CONSOLE_SITE="sc-domain:tradingstrategy.ai"
```

The service account key file must **not** be placed anywhere in the repository, not even in gitignored directories such as `data/`. Keep it under `~/.tradingstrategy/` with `chmod 600`.

## How the credentials were created

All steps are done in the [Google Cloud console](https://console.cloud.google.com/) and [Search Console](https://search.google.com/search-console). None of the APIs used incur charges, but Google Cloud projects inside an organisation require a billing account to be attached at creation time.

### 1. Google Cloud project

Create a dedicated project for SEO tooling rather than reusing an unrelated one. The project ID cannot be changed later.

### 2. Enable the APIs

In **APIs & Services → Library**, enable:

- Chrome UX Report API (`chromeuxreport.googleapis.com`)
- PageSpeed Insights API (`pagespeedonline.googleapis.com`)
- Google Search Console API (`searchconsole.googleapis.com`)

### 3. API key for CrUX and PageSpeed

In **APIs & Services → Credentials → Create credentials → API key**:

- Give it a descriptive name (e.g. `frontend-crux`).
- Under **API restrictions**, restrict the key to the Chrome UX Report API and PageSpeed Insights API only. An unrestricted key would work for any enabled API in the project.
- Leave application restrictions as _None_ (the scripts run from developer machines and CI, not from a fixed IP or website).

Copy the key into `TS_PRIVATE_GOOGLE_CRUX_API_KEY`. The key is shown once in the creation dialog but can be viewed again from the credentials list.

### 4. Service account for Search Console

In **IAM & Admin → Service accounts → Create service account**:

- Name it for its purpose (e.g. `search-console-reader`).
- Do **not** grant any Google Cloud IAM roles. Search Console access is granted inside Search Console itself, not through Cloud IAM; the service account needs no project permissions.
- After creation, open the account → **Keys → Add key → Create new key → JSON**. The browser downloads the private key file. Move it to `~/.tradingstrategy/google-service-account.json` and set `TS_PRIVATE_GOOGLE_SERVICE_ACCOUNT_FILE` to that path.

The key never expires and cannot be re-downloaded. If it is lost or leaked, delete it from the Keys tab and create a new one. Google automatically disables service account keys it finds in public repositories.

### 5. Grant the service account access to the property

In Search Console, open the property → **Settings → Users and permissions → Add user**:

- Email: the service account's email (`<name>@<project-id>.iam.gserviceaccount.com`, shown on the service account details page).
- Permission: **Full**. _Restricted_ is enough for search analytics and sitemaps, but the URL inspection API requires Full or Owner.

Adding a user requires Owner permission on the property.

## Verifying the setup

```shell
pnpm run seo:cwv                                   # origin-level CWV for phone and desktop
pnpm run seo:search-console sites                  # should list the property with permission siteFullUser
pnpm run seo:search-console pages --limit 10
```

If `sites` returns an empty result the service account authenticated successfully but has not been added to the property (step 5). A `token exchange failed` error means the key file is missing, malformed, or the key has been deleted.

## How the scripts authenticate

- **CrUX / PageSpeed**: the API key is passed as the `key` query parameter on each request.
- **Search Console**: the script signs a JWT with the service account's RSA private key using `node:crypto` and exchanges it at `https://oauth2.googleapis.com/token` for a one-hour access token with the `webmasters.readonly` scope. This is the standard service-account flow, implemented without the `googleapis` client library to avoid adding dependencies.

## Script reference

### `pnpm run seo:cwv`

| Option                            | Description                                                                                |
| --------------------------------- | ------------------------------------------------------------------------------------------ |
| `--url <url>`                     | Page-level record instead of the origin (only for pages with enough traffic to be in CrUX) |
| `--device phone\|desktop\|tablet` | Single form factor instead of phone and desktop                                            |
| `--history`                       | Weekly p75 time series (25 rolling 28-day windows) for LCP, INP and CLS                    |
| `--json`                          | Raw API response                                                                           |

Note that origin-level CrUX data can be "good" while Search Console flags many URLs as needing improvement — Search Console groups by URL pattern, whereas the origin record aggregates all page loads.

### `pnpm run seo:search-console <command>`

| Command         | Description                                                        |
| --------------- | ------------------------------------------------------------------ |
| `sites`         | Properties the service account can access and its permission level |
| `pages`         | Top pages by clicks (`--days`, `--limit`)                          |
| `queries`       | Top search queries by clicks (`--days`, `--limit`)                 |
| `sitemaps`      | Submitted sitemaps with counts, errors and last download time      |
| `inspect <url>` | Index status, canonical, last crawl and robots verdict for one URL |

All commands accept `--json` for the raw response. Search analytics windows end three days ago because Search Console data lags by two to three days.

## Frontend SEO controls

Where the search-facing behaviour lives in this codebase (added in response to the audit below; the implementation plan is `.claude/plans/seo-and-core-web-vitals.md`):

| Concern                                        | Where                                                                                                                                                                                                                                                                                                                                                 |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `noindex` for dead / spam token and pair pages | `src/lib/explorer/indexing.ts` — thresholds `INDEXABLE_MIN_LIQUIDITY_USD` and `INDEXABLE_MIN_VOLUME_USD`; the token and pair loaders return `robots`. Missing metrics keep a page indexable; only confirmed low values exclude it.                                                                                                                    |
| `noindex` for empty vault pages                | `isVaultIndexable()` in `src/lib/explorer/indexing.ts` (pure rule) and the `VaultInfo` adapter of the same name in `src/lib/top-vaults/helpers.ts` (USD conversion, protocol and blacklist classification); used by the vault detail loader and `vaults/sitemap.xml`. Blacklisted and unknown-protocol listings are `noindex` and not in the sitemap. |
| `noindex` for generated images                 | `handleImageEndpointRobots` in `src/hooks.server.ts` sets `X-Robots-Tag: noindex` on `/social-card/*` and `/metadata-logo/*`, including their redirects. Export-data pages and unnamed exchanges (`isUnknownExchangeName`) return `robots` from their loaders.                                                                                        |
| Titles, descriptions, `og:image`               | `SocialCardMetaTags` (`titleParts` → `getPageTitle()` in `src/lib/helpers/seo.ts`, description cut by `getMetaDescription()`, default social image); every indexable template uses it. `tests/integration/head-meta.test.ts` asserts one canonical, one branded title, a 70–155 character description and one `og:image` on 17 routes.                |
| Structured data                                | `organizationSchema()` (home), `BlogPosting` (blog post), `BreadcrumbList` as JSON-LD on vault detail pages and as microdata via `Breadcrumbs.svelte` elsewhere — never both on one page.                                                                                                                                                             |
| Font layout shift                              | Metric-matched fallback faces in `src/lib/components/css/font-fallbacks.css` (render-blocking; see `docs/speed.md`); `src/lib/server/font-preload.ts` sends the `Link` preload headers on HTML responses only.                                                                                                                                        |
| Blog embeds                                    | `transformPostHtml()` in `src/lib/blog/embeds.ts` turns YouTube iframes into a click-to-load facade and lazy-loads the rest; applied in the post loader.                                                                                                                                                                                              |
| `noindex` for adult / gambling names           | `NOINDEX_NAME_PATTERN` and `hasBlockedName()` in the same file, applied to token names/symbols and pair symbols regardless of liquidity. English-only by design.                                                                                                                                                                                      |
| Canonical URL on every page                    | `src/lib/header/AppHead.svelte` emits the single `<link rel="canonical">` (`$lib/helpers/canonical.ts`); loaders adjust it with `lowercaseCanonical` (token pages) or `canonical` (vault comparisons). Never add a second one.                                                                                                                        |
| Strategy page titles and descriptions          | `getStrategyPageMeta()` in `src/lib/strategies/seo.ts`, used by both strategy overview routes                                                                                                                                                                                                                                                         |
| Sitemap index                                  | `src/routes/sitemap.xml/+server.ts` — the backend pair sitemaps are deliberately not listed (most pair pages are `noindex`)                                                                                                                                                                                                                           |
| Podcast announcement visibility                | `src/routes/_components/AnnouncementBanner.svelte` renders on non-home pages, derives dismissal from the server cookie, and is hidden at the small-screen breakpoint; guarded by `tests/integration/announcement.test.ts`                                                                                                                             |
| Render-blocking CSS                            | `kit.inlineStyleThreshold` in `svelte.config.js` (compared against uncompressed CSS size at build time)                                                                                                                                                                                                                                               |
| Vault sparkline layout shift                   | `src/lib/top-vaults/VaultSparkline.svelte` declares the 72×18 intrinsic size and a 4:1 wrapper                                                                                                                                                                                                                                                        |
| Ghost blog images                              | `src/lib/blog/images.ts` routes both `<ghost api host>` and `storage.ghost.io` images through `/blog/image/`                                                                                                                                                                                                                                          |
| Glossary page weight                           | `src/routes/glossary/*/+page.server.ts` return only what each page renders (`loadGlossaryForPage`)                                                                                                                                                                                                                                                    |
| Vault listing page weight                      | `INITIAL_VAULT_LISTING_LIMIT` (75 rows) and `toVaultListingRow()` in `src/lib/top-vaults/helpers.ts`; guarded by `tests/integration/vaults/page-weight.test.ts`                                                                                                                                                                                       |

## Site audit 2026-09-16

Research date: **16 September 2026**. Data was pulled through the APIs above (nothing in this section was read from the Search Console UI except where stated). Windows used:

- Search analytics: 28 days, 2026-08-16 → 2026-09-13 (Search Console lags ~3 days)
- Trend: 90 days, weekly buckets
- CrUX field data: 28-day window ending 2026-09-14
- PageSpeed Insights: mobile lab runs (emulated Moto G, slow 4G) on 16 September 2026; two runs per page because single runs vary a lot
- URL inspection: 28 URLs (top pages by impressions plus key landing pages)

Reproduce with `pnpm run seo:search-console pages --limit 5000 --json`, `pnpm run seo:cwv`, `pnpm run seo:cwv --history`, and `pnpm run seo:search-console inspect <url>`.

### Headline numbers

| Metric (28 days)            | Value                                           |
| --------------------------- | ----------------------------------------------- |
| Clicks                      | 2,601                                           |
| Impressions                 | 540,819                                         |
| Pages with ≥1 impression    | 5,000+ (API row cap reached)                    |
| Mobile share of impressions | 79 % (mobile CTR 0.5 %, desktop 0.4 %)          |
| Top country                 | Indonesia — 66 % of impressions, 40 % of clicks |
| Weekly clicks, June → Sept  | ~340/week → ~540/week                           |

Impression spikes in mid-June (232k) and mid-August (208k) are almost entirely one token page (see problem 1).

### Traffic by page type

| Route pattern                             | Pages | Clicks | Impressions | CTR    | Avg position |
| ----------------------------------------- | ----- | ------ | ----------- | ------ | ------------ |
| `/trading-view/<chain>/tokens/<addr>`     | 2,062 | 1,897  | 446,694     | 0.42 % | 6.8          |
| `/docs/*` (Sphinx docs, not this app)     | 444   | 76     | 28,530      | 0.27 % | 10.6         |
| `/glossary/<term>`                        | 200   | 62     | 25,374      | 0.24 % | 34.9         |
| `/trading-view/<chain>/<exchange>/<pair>` | 1,839 | 244    | 21,934      | 1.11 % | 9.1          |
| `/blog/<post>`                            | 99    | 31     | 7,658       | 0.40 % | 10.6         |
| `/vaults*`                                | 135   | 194    | 5,728       | 3.39 % | 7.3          |
| `/` (home)                                | 1     | 81     | 1,855       | 4.37 % | 9.0          |
| `/strategies/<id>`                        | 130   | 2      | 1,344       | 0.15 % | 9.6          |
| `/trading-view/<chain>/<exchange>`        | 21    | 0      | 127         | 0.00 % | 44.2         |

Vault pages are the only content type with a healthy CTR. Everything else is either low-intent traffic (token pages) or ranking too low to be clicked (glossary).

### Problem 1 — organic traffic is dominated by spam-token pages

83 % of impressions and 73 % of clicks land on token pages, and the queries behind them are not trading queries. Top queries in the window:

| Query                                                        | Clicks    | Impressions | Landing page                                                          |
| ------------------------------------------------------------ | --------- | ----------- | --------------------------------------------------------------------- |
| `eporn`                                                      | 1,100     | 383,515     | `/trading-view/binance/tokens/0xf8001219…` — token "EverPorn" (EPORN) |
| `wdbet`                                                      | 97        | 507         | token page                                                            |
| `polymusk`                                                   | 41        | 1,715       | token page                                                            |
| `xnudes`                                                     | 36        | 2,294       | token page                                                            |
| `slgns`                                                      | 33        | 508         | token page                                                            |
| `trading strategy`                                           | 21        | 685         | `/`                                                                   |
| `xxxbnb`, `xbzz`, `wg999`, `bokepon`, `slotcoiner`, `xboobs` | 8–15 each | —           | token pages                                                           |

Most of these tokens have a single trading pair and negligible liquidity. Only one page on the whole site (the EPORN token page) has enough real-user traffic to get its own CrUX record; the home page does not.

Why it matters: the site's search footprint is being defined by adult and gambling token names, mostly from one country. That dilutes topical relevance for the queries the site actually wants (`hyperliquid vaults` ranks at position 13, `alpha signal` at 6.5 with 0.5 % CTR), spends crawl budget on thousands of near-empty pages, and is a manual-action risk.

Recommendation: gate indexing of `/trading-view/<chain>/tokens/<addr>` and pair pages on a quality threshold (e.g. minimum liquidity/volume, more than one pair, not blacklisted) — emit `<meta name="robots" content="noindex">` below the threshold and drop those URLs from the sitemap. The pages can stay reachable for users.

### Problem 2 — glossary pages rank on page 4–7

The 200 glossary pages average position 34.9. The generic terms with the most impressions rank worst:

| Page                                         | Impressions | Position |
| -------------------------------------------- | ----------- | -------- |
| `/glossary/leverage`                         | 3,117       | 62.4     |
| `/glossary/compound-annual-growth-rate-cagr` | 1,131       | 68.5     |
| `/glossary/stop-loss`                        | 862         | 56.0     |
| `/glossary/maximum-drawdown`                 | 744         | 60.8     |
| `/glossary/volatility`                       | 387         | 75.3     |

Only DeFi-specific terms do well (`/glossary/hyperliquid-provider-vault` position 11.3, `/glossary/alpha-signal` 8.9). Each glossary term page is a **198 KB HTML document** (PSI network log) — roughly the size of the full glossary — and lab FCP is 3.8 s. The glossary sitemap also carries 37 warnings (the API only exposes the count).

Recommendation: stop competing on generic finance terms, or give those pages real depth; either way the per-term page should not ship the whole glossary in its HTML.

### Problem 3 — missing canonical tags on most of the site

URL inspection shows Google had to choose the canonical itself (`userCanonical` absent) for every token, pair, exchange, chain and glossary page inspected, plus `/about` and `/pricing`. Confirmed in code: `canonical={pageUrl}` is set only on home, `/vaults/**`, `/strategies/**` and blog posts.

Roughly 4,000 indexed pages have no declared canonical, so any query-string or trailing-slash variant that gets linked is a duplicate candidate. Add the canonical on the trading-view and glossary layouts.

### Problem 4 — Google still holds stale `/trading-view/vaults*` URLs

| URL                                 | Status now                  | Google's view                                                                                            |
| ----------------------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------- |
| `/trading-view/vaults`              | 301 → `/vaults`             | "Soft 404", last crawled 2026-05-06; Google's referrer list names `sitemap-static.xml` and the docs site |
| `/trading-view/vaults/stablecoins`  | 301 → `/vaults/stablecoins` | "Page with redirect", linked from glossary and vault pages                                               |
| `/trading-view`                     | 301 → `/vaults`             | "Page with redirect", linked from `/vaults` and `/datasets`                                              |
| `/trading-view/ethereum/uniswap-v3` | 200                         | "Crawled – currently not indexed", last crawled 2026-04-08                                               |

The referrer information is stale: `sitemap-static.xml` (`src/routes/sitemap-static.xml/+server.ts`) no longer lists these URLs and no frontend source links to them, so nothing remains to fix in this repository — Google simply has not recrawled them since May. The remaining referrers (the docs site's `defi-vault-data.html` page and glossary content) live in other repositories. The exchange index pages (`/trading-view/<chain>/<exchange>`) are effectively not indexed at all — 21 pages, position 44, zero clicks.

Sitemap housekeeping: the `web3-ethereum-defi` subdomain sitemap was last fetched by Google in February 2026, and the vault sitemap is registered with a `?version=2` query string.

### Problem 5 — Core Web Vitals

**Field data (CrUX, origin level)** is green on both form factors, but mobile is close to the edge and CLS has been drifting up:

| Mobile p75 | Value    | Rating             | Trend (weekly p75, last 8 weeks)  |
| ---------- | -------- | ------------------ | --------------------------------- |
| LCP        | 2,358 ms | good (limit 2,500) | 2,555 → 2,359 ms, improving       |
| INP        | 159 ms   | good               | 144 → 176 → 159 ms                |
| CLS        | 0.09     | good (limit 0.10)  | **0.04 → 0.09 since late August** |
| FCP        | 2,090 ms | needs improvement  |                                   |
| TTFB       | 1,011 ms | needs improvement  |                                   |

Desktop: LCP 1,820 ms, INP 54 ms, CLS 0.03 — all good.

The Search Console CWV report (read in the UI on 2026-09-16; it is not available through the API) groups by URL rather than origin and shows **306 mobile URLs "needs improvement"** — CLS > 0.1 on 192 URLs and LCP > 2.5 s on 114 URLs — against 143 good and 0 poor. So the origin average hides page groups that fail.

**Lab data (PageSpeed Insights, mobile)** shows where the time goes:

| Page type     | Score | LCP       | TBT         | CLS           | LCP element                         | Element render delay |
| ------------- | ----- | --------- | ----------- | ------------- | ----------------------------------- | -------------------- |
| Home          | 65–74 | 5.9–6.0 s | 7–78 ms     | 0.00          | hero banner text                    | —                    |
| `/vaults`     | 24–35 | 6.6–8.1 s | 0.6–1.4 s   | **0.19–0.30** | hero subtitle text                  | 1.8 s                |
| Vault page    | 66    | 5.2 s     | 271 ms      | 0.08          |                                     |                      |
| Token page    | 69–81 | 3.8 s     | 61–88 ms    | 0.00–0.29     | summary paragraph                   | 2.4 s                |
| Pair page     | 76–77 | 2.6–4.2 s | 0–19 ms     | 0.00–0.36     | announcement banner (at audit time) | 2.5 s                |
| Glossary term | 73    | 4.2–4.7 s | 0–2 ms      | 0.08–0.12     | definition paragraph                | 1.3 s                |
| Blog post     | 47–70 | 4.5–5.9 s | 12 ms–2.7 s | 0.00–0.08     | cover image                         | 2.0 s                |
| `/strategies` | 50–81 | 4.5–4.7 s | 30 ms–1.3 s | 0.00          | page description text               | 0.9 s                |

Consistent findings across pages:

1. **LCP is not a server problem.** Server response is 5–144 ms on every page. The LCP element is a text node in almost every case, and 1–2.5 s of the LCP is "element render delay": the HTML has arrived but the browser is waiting on render-blocking CSS. SvelteKit emits one small CSS file per component (`Tooltip.css`, `Spinner.css`, `TradingDataInfoRow.css` at 6 KB alone costs ~600 ms, `Section.css`, `OptInBanner.css`, …) and Lighthouse estimates 300–840 ms of savings per page from them. Inlining critical CSS or bundling the per-component CSS into fewer files is the single biggest LCP lever.
2. **Vault listing CLS comes from unsized sparkline images.** `td.sparkline > div.vault-sparkline > img` has no intrinsic size, scoring 0.30 on its own. This affects every `/vaults/*` listing page (135 indexed). Give the `<img>` explicit `width`/`height` (or an `aspect-ratio` on the wrapper).
3. **The home page loads a 1.7 MB PNG** from Ghost (a blog cover, 1168×1168 displayed at 408×380). Lighthouse estimates 1.5 MB of waste. Blog post covers have the same problem at a smaller scale (301 KB, 1408 px wide displayed at 665 px). Request sized WebP variants from the Ghost image API.
4. **One Svelte runtime chunk causes long tasks and forced reflows** on every page (`/_app/immutable/chunks/DT-NfHcI.js`): 949 ms long task and 427 ms of forced reflow on `/vaults`, 20–30 ms of reflow elsewhere. The vault table is the worst case — 174 KB of HTML and up to 10 s of main-thread work in the lab.
5. **Historical note — the announcement banner was the LCP element on pair pages**: the banner is now hidden below the small-screen breakpoint, so it no longer contributes to mobile LCP.
6. **Fonts**: 4–6 font files, 127–159 KB per page. `font-display` is already correct (no penalty reported).
7. Minor: the Cloudflare Insights beacon ships 11 KB of legacy polyfills; ~23 KB of the Svelte runtime is duplicated across chunks.

### Problem 6 — strategy pages get impressions but no clicks

130 `/strategies/<id>` pages received 1,344 impressions at position 9.6 and 2 clicks (0.15 % CTR). Position is fine; the snippet is not earning the click. Worth reviewing titles and meta descriptions on those pages.

### Suggested priority

1. Noindex low-quality token and pair pages (problem 1) — biggest effect on what the site ranks for.
2. Size the vault sparkline images (problem 5.2) — one-line fix for the CLS regression on 135 listing pages.
3. Reduce render-blocking CSS (problem 5.1) — moves LCP on every page type.
4. Serve sized WebP blog covers on home and blog (problem 5.3).
5. Add canonical tags to trading-view and glossary layouts (problem 3).
6. Ask the docs and glossary owners to update their `/trading-view/vaults*` links (problem 4; nothing left to change in this repository).
7. Cut glossary page weight and decide which glossary terms are worth ranking for (problem 2).

## Optimising the website — 2026-09-16

Work done on 16 September 2026 in response to the audit above, on branch `seo-core-web-vitals` (implementation plan: `.claude/plans/seo-and-core-web-vitals.md`). Before/after figures were measured locally against a production build (`pnpm run build` + `pnpm run preview`) serving the real vault dataset, unless stated otherwise. Field data (CrUX, Search Console) only moves after deployment and lags by ~28 days; re-run the audit commands then and append the results here.

### Stop indexing dead and spam token/pair pages

`src/lib/explorer/indexing.ts` decides whether a token or pair page is indexable: liquidity/TVL ≥ $5,000 or volume ≥ $1,000 (24 h for tokens, 30 d for pairs). Pages below both thresholds emit `<meta name="robots" content="noindex,follow">`; pages with no metrics at all stay indexable so missing data is never treated as low quality. The tag is `$derived`, so client-side navigation between tokens updates it.

Dry run against the top 500 pages by clicks: **174 of the 217 token pages become `noindex`, carrying 1,812 of their 1,897 clicks** — exactly the adult/gambling token set (EverPorn, WorldBet, PolyMusk, XNUDES, Bokep, WG999 …), while USDT, bridged USDT and other real tokens stay indexed. Pair URLs in the backend sitemaps still need the same rule applied backend-side.

### Canonical URLs on every indexable route

New `CanonicalLink` component (`$lib/helpers/canonical.ts`) on the chain, exchange, pair, token (address lowercased), glossary, about and pricing routes — roughly 4,000 indexed pages that previously declared no canonical. Query strings such as `?timeBucket=` are dropped. Routes that already set `canonical` through `svelte-meta-tags` were left alone; verified exactly one canonical tag per page type.

### Vault sparkline layout shift

**Correction (post-release, 2026-09-16):** the Search Console CLS report groups flagged
URLs by template, and its two groups are the **token pages** (219 URLs, group CLS 0.11)
and the **pair pages** (135 URLs, 0.11) — not the vault listings, which have too little
mobile traffic for CrUX to report on. The sparkline fix below is still correct for
`/vaults`, but the field CLS regression lives on the trading-view pages and its cause is
not yet identified (candidates: the client-side pairs table and lazy chart mounting
without reserved space). Fix validation for CLS was therefore **not** started.

`VaultSparkline.svelte` declares the sparkline's 72×18 intrinsic size, reserves a 4:1 box for the loading/fallback state and lazy-loads the images. Lighthouse attributed a **0.30 CLS** to the unsized sparkline `<img>` on `/vaults`; the culprit entry is gone from `cls-culprits-insight`. This is the most likely cause of mobile field CLS drifting from 0.04 to 0.09 in late August, and affects all 135 indexed listing pages.

### Render-blocking CSS

`kit.inlineStyleThreshold: 8192` in `svelte.config.js` inlines the 119 (of 126) emitted stylesheets under 8 KB into the document. Render-blocking stylesheet requests per page fell from **~15–25 to 4–6** (the remaining ones are large shared chunks, kept external and cacheable) at a cost of 13–27 KB of uncompressed inline CSS per page. Lighthouse had charged 300–840 ms of LCP "element render delay" to these requests. The threshold is compared against uncompressed size at build time; raising it to inline the shared chunks too is deferred until this step is measured in the field.

### Ghost blog images through the resize proxy

Root cause: Ghost moved image hosting to `storage.ghost.io`, and `getBlogImageUrl` only rewrote URLs on the Ghost API host, so every blog image bypassed the `/blog/image/` resize/WebP proxy. Fixed in `src/lib/blog/images.ts`; the blog post header image also gained a sized `srcset`, explicit dimensions and `fetchpriority="high"`.

- Home page blog tiles: **1,684 KB PNG → 9 KB WebP** each (Lighthouse estimated 1.5 MB of waste on `/`)
- Blog post header: **301 KB → 27 KB WebP**

### Glossary page weight

`/glossary/<term>` pages serialised the entire glossary into their HTML because the layout `load` returned it. Replaced with `+page.server.ts` loaders that return only the rendered entry (`loadGlossaryForPage`).

- `/glossary/leverage`: **1,145 KB → 91 KB** uncompressed (198 KB → ~19 KB on the wire), for all 200 glossary pages

### Podcast announcement hidden on mobile

The podcast announcement is server-rendered on non-home pages and hidden below the small-screen breakpoint. Its dismissal state is derived from the request cookie. This prevents the notice from becoming the mobile LCP element while preserving the promotion on larger screens.

### Vault listing page weight

Three changes to the listing pages (`/vaults`, chain, protocol, stablecoin, curator and category listings), guarded by `tests/integration/vaults/page-weight.test.ts`:

1. **Initial batch back to 75 rows** (`INITIAL_VAULT_LISTING_LIMIT`) — it had been raised to 125 inside an unrelated fix (#1362), undoing an earlier perf PR.
2. **Row projection** — `toVaultListingRow()` strips each row from the full 83-field `VaultInfo` (~7.7 KB) to the 55 fields the table reads, and `period_results` from six periods × 24 metrics to the 3M/6M/1Y/lifetime periods × 10 metrics the return columns use. Applied to the SSR batch and the continuation endpoint so both share one shape.
3. **Lazy tooltips** — `Tooltip.svelte` renders its popup only on first hover/focus. Listing rows carry ~7 tooltips whose hidden, repetitive popup markup was 39 % of the table HTML; the popup could only open after hydration anyway, so nothing visible changed. Site-wide benefit.

| `/vaults` (real data)        | Before                    | After                    |
| ---------------------------- | ------------------------- | ------------------------ |
| HTML                         | 1,734 KB                  | **637 KB** (−63 %)       |
| On the wire (gzip)           | 189 KB                    | **70 KB**                |
| Serialised page data         | 873 KB (7.2 KB/row × 125) | 235 KB (3.2 KB/row × 75) |
| Table markup                 | 747 KB                    | 294 KB                   |
| Hidden tooltip popups in DOM | ~555                      | 0                        |

`/vaults/chains/base`: 1,590 KB → 612 KB. The remaining ~4 KB per row is Svelte class hashes and hydration markers.

### Summary of improvements

| Metric                                | Before                         | After                                |
| ------------------------------------- | ------------------------------ | ------------------------------------ |
| `/vaults` document                    | 1,734 KB / 189 KB gz           | 637 KB / 70 KB gz                    |
| `/glossary/<term>` document           | 1,145 KB                       | 91 KB                                |
| Home page largest image               | 1,684 KB PNG                   | 9 KB WebP                            |
| Render-blocking CSS requests per page | ~15–25                         | 4–6                                  |
| Lab CLS culprit on listing pages      | 0.30 (sparkline)               | removed                              |
| Pages with a declared canonical       | home, vaults, strategies, blog | + ~4,000 trading-view/glossary pages |
| Spam token pages in the index         | all                            | 174 of the top 217 marked `noindex`  |

Expected effect on the audit's numbers, to be confirmed after deploy with `pnpm run seo:cwv --history` and `pnpm run seo:search-console pages`:

- **LCP**: the 0.9–2.5 s "element render delay" was render-blocking CSS; with 4–6 blocking requests instead of ~20, the mobile p75 (2,358 ms against a 2,500 ms limit) should move clearly into "good". The home page also no longer downloads a 1.7 MB image on first paint.
- **CLS**: the sparkline fix targets the exact culprit behind the 192 mobile URLs flagged for CLS; expect the mobile p75 to return towards 0.04 over the next 28-day window.
- **Main-thread time on `/vaults`**: 63 % less HTML to parse, 73 % less page data to deserialise and ~555 fewer DOM subtrees to hydrate address the 10 s main-thread / 949 ms long-task finding.
- **Search footprint**: as Google recrawls the `noindex` pages, adult/gambling token names should drop out of the top queries and the token pages' 83 % share of impressions should fall.

Not done (plan workstream 7): the `/vaults` table's client-side sort/format work, strategy page meta descriptions, and the backend-side sitemap thresholds — picked up in the follow-up round below.

### Post-release Search Console actions (2026-09-16)

Done through the Search Console UI after the release:

- **URL inspection, live test** of the EverPorn token page: "Page cannot be indexed: Excluded by 'noindex' tag", user-declared canonical picked up. "Request indexing" is rejected for `noindex` pages, so re-crawl cannot be forced that way.
- **Removals → Temporarily remove URL** submitted for that one page (95 % of the spam impressions). The removal hides it within hours and lasts about six months; with `noindex` in place it will not come back. The other `noindex` pages drop out as Google recrawls them.
- **Core Web Vitals → mobile → LCP issue: "Validate fix" started** (single URL group: pair pages, 135 URLs, 3.1 s). Google reports within 28 days.
- CLS validation not started — see the correction under "Vault sparkline layout shift".
- Page indexing report at release time, for reference: 29.2K indexed, 45.4K not indexed (4,522 "page with redirect", 1,677 404, 1,633 blocked by robots.txt, 1,256 alternate page with canonical, 549 duplicate without user-selected canonical, 377 soft 404, 161 5xx).

## Follow-up round — 2026-09-16

Second round after the release of the changes above; the plan is `.claude/plans/seo-follow-ups.md`. Numbers below are from local production builds (real data) and the Search Console UI on 16 September 2026.

### Former mobile CLS root cause: the announcement banner was not server-rendered

Reproduced with a `layout-shift` `PerformanceObserver` on a throttled phone profile against production: on every page the whole `<main>` moved down by 92 px once hydration finished (score 0.119, the same 0.11 Search Console reports for the token and pair groups). The candidates named earlier — the pairs table skeleton and the lazy candle chart — produce no measurable shift (≤ 0.007 including scrolling).

The cause was `AnnouncementBanner.svelte`: its dismissed flag lived in a module-level `writable` store, which on the server is shared by every request and was never reset to `false`. After the first visitor with the dismissal cookie, the server rendered the banner for nobody, and each browser then mounted it after hydration, pushing the page down. The component now derives the SSR state from the cookie prop alone and keeps only a client-side session flag. It is also hidden on mobile, so it cannot affect mobile layout or LCP. Local production build after the server-rendering fix: CLS 0.001–0.007 on the two Search Console example pages and on `/trading-view/ethereum/uniswap-v3/eth-usdc-fee-5`.

Guards: `tests/integration/announcement.test.ts` verifies that the server renders the banner for a visitor without the dismissal cookie, that it is hidden on mobile, and that it can be dismissed; `tests/integration/layout-shift.test.ts` installs the observer before navigation on the token and pair pages (with the `pairs` request delayed) and asserts CLS < 0.05.

### Name blocklist

`hasBlockedName()` in `src/lib/explorer/indexing.ts` marks token and pair pages `noindex` when the name or symbol contains an adult or gambling term (NFKD-normalised, `-`/`_`/`/` treated as word separators, short words such as `bet`, `slot`, `cum`, `anal` whole-word, `sex`/`cock` word-start). Dry run over the top 500 pages by clicks plus the earlier bad-word candidates (372 pages resolved through the public API): exactly the four pages that had escaped the liquidity thresholds change — PornForce ($225k), Nude AI ($115k), PORNHUB-ETH ($53k TVL), XXX-BNB ($9k TVL). Note that `BET-USDT` on Polygon (`bet` whole-word) would also be excluded; it was not in the sample.

### Strategy page titles and descriptions

`getStrategyPageMeta()` produces `<name> — automated DeFi vault on <chain> | Trading Strategy` (dropping detail until it fits 60 characters) and a description that leads with the live annualised return and TVL when both are known and positive, otherwise the strategy's own short description; both routes (API and YAML strategies) use it with the same figures their pages display. Target: CTR on `/strategies/<id>` above 1 % at the current ~10th position (0.15 % before).

### One canonical mechanism

`AppHead.svelte` now emits the canonical for every page from `page.data`; the 36 `canonical={pageUrl}` props, the `CanonicalLink` component and its nine placements are gone, so a page can no longer end up with two canonicals or none. Query strings are dropped except where they identify the page (`/vaults/compare?vault=…`, set by that loader). `tests/integration/canonical.test.ts` asserts exactly one canonical with the expected value on twelve routes, including a mixed-case token address and parameterised URLs.

### Pair sitemaps no longer submitted

The sitemap index no longer lists `api/sitemap/pairs/paged/N.xml` (6,674 pair URLs). Measured before removal: of those, 6,649 are known to the pairs API and **4,077 are indexable** under `isPairIndexable`; only **34 of the 4,077 (0.8 %)** are linked from server-rendered HTML (the first page of each `trading-pairs` listing). Chain pages stream their top-pair tables, exchange and token pages fetch their pair tables client-side, so the long tail of indexable pairs is now discoverable only through Google's existing knowledge of the URLs and client-rendered links. This is a deliberate decision; if pair-page impressions fall noticeably, the fix is a sitemap that lists only indexable pairs (the pairs API has 15,312 of them out of 52,028).

### `/vaults` main-thread work

CPU profile of hydration on a 4×-throttled phone: the long task was Svelte hydration of the 75-row table plus two **forced layouts** — `bind:offsetWidth` on the table (read synchronously during hydration for `--table-width`) and the `visualViewport` height read on `<body>`. Both are gone: `use:tableWidth` (`src/lib/actions/table-width.ts`) sets `--table-width` from a `ResizeObserver` only, and `--viewport-height` is maintained on the full-screen dialog that consumes it rather than on `<body>`, where every mobile address-bar resize invalidated the styles of the whole page. Longest hydration task ~800 ms → ~450 ms (4× throttling); the remainder is hydration proper. SvelteKit's own `pageXOffset` read at the end of hydration still forces one style pass and is not ours to change.

### Search Console housekeeping

- Sitemaps: `https://tradingstrategy.ai/vaults/sitemap.xml` submitted (read immediately, 5,268 URLs); the `trading-view/vaults/sitemap.xml?version=2` entry removed; the glossary sitemap resubmitted (all 404 of its URLs return 200 today, so the 37 warnings from the 8 September read are stale).
- Page indexing report, read from the UI (the API does not expose these lists):
  - **Blocked by robots.txt** (1,633; 510 examples): 281 old `/api/{execution,technical-analysis,client}/help/*.html` documentation URLs that now 404, 174 `/api/pairs?…export_format=excel` links from the exchange export-data page, 55 `trade-<id>.json` raw-data links. The two link sources now carry `rel="nofollow"`; the API stays blocked.
  - **Page with redirect** (4,522; 845 examples): 746 legacy `/trading-view/vaults/<slug>` and `/trading-view/<chain>/vaults/<slug>` URLs (some with `?a=` or `?ref=` parameters) that 301 to `/vaults/<slug>`, plus `/docsprogramming/*`. No internal link produces them; nothing to change.
  - **Soft 404** (377): 263 of the same legacy vault URLs crawled before the consolidation (now 301), 27 dead token pages (now `noindex`), a handful of logo SVGs and wizard pages. No template renders an empty page.
  - **5xx** (161): 45 `/social-card/vault/…` image URLs (now 400), retired strategy pages (`enzyme-*`, `base-memex`, now 404) and 11 token pages from the 4–5 September window.
- Glossary rankings (workstream 7): 225 glossary pages had impressions in the last 90 days; 103 sit at position ≤ 20 (DeFi-specific: `hyperliquid-provider-vault`, `alpha-signal`, `forward-fill`, `quantstats`, `martin-ratio`, `clmm`, `erc-7540` …) and 122 at position > 20 with essentially zero clicks (generic: `leverage` 55, `stop-loss` 54, `cagr` 68, `volatility` 73, `apr` 78). The generic terms are left as they are — Google ignores sitemap `priority`, and the content lives in the docs repository.

Not done: the `inlineStyleThreshold` step (waits for the LCP validation result), index-bloat follow-up (waits for the next full recrawl), and glossary content work (docs repository).

## Round 3 — 2026-09-17

Third round, planned in `.claude/plans/seo-round-3.md` after a live audit on 17 September 2026 (PageSpeed Insights API mobile runs on six templates, Search Console UI, SSR HTML of ~25 page types). Numbers below are from that audit and from local test-mode builds; field data follows after the usual 28-day window.

### Findings that drove the work

- **Vault pages were the next index-bloat source**: 4,681 detail URLs in the vault sitemap, all `index,follow`; a random sample had half under $5k TVL and a third on "Unknown vault protocol", some titled `<unnamed>`. Search Console's "Crawled – currently not indexed" bucket held 35K URLs.
- In a 1,000-URL sample of that bucket, **44 % were `/social-card/…` image URLs** (og:image endpoints with `?fallback=` params), plus `/metadata-logo/…`; the 549 "Duplicate without user-selected canonical" URLs were `/trading-view/<chain>/<0xaddress>/export-data` pages of unnamed exchanges.
- **Web-font swap was the remaining CLS**: 0.25 on a glossary page, entirely "Web font" culprits. The previous plan's statement that fallbacks were size-adjusted was wrong — there were none, and `docs/speed.md` described a mechanism that no longer existed.
- **Blog post lab LCP 16.7 s**: the YouTube player (~1.6 MB) loaded before the cover image.
- Thin metadata: home title `Trading Strategy` with a 36-character description; the brand suffix and `og:image` only on templates using `SocialCardMetaTags`; blog descriptions 500 characters; blog JSON-LD a `NewsArticle` by a `Person`.

### What changed

1. **Vault index hygiene.** `isVaultIndexable`: not indexable when blacklisted, the name is blank/placeholder or blocklisted, current _and_ peak TVL (in USD — `current_nav` is in denomination units) are confirmed below $5,000, or the protocol is unknown and the current TVL is below $5,000. Missing TVL or a missing USD rate keeps a page indexable. Dry run against the live dataset on 2026-09-17: **1,041 of 4,681 listed vaults (22 %) become `noindex`** — 896 unknown-protocol vaults whose TVL has left (peak ≥ $5k, now < $5k), 122 with never more than $5k, 20 placeholder names, 3 blocklisted names; 8 named vaults with no TVL data stay indexable. The sitemap shrinks from 5,280 to 4,237 URLs. Search Console fix validation should not be started for these; watch indexed vault URLs instead.
2. **Crawl waste.** `X-Robots-Tag: noindex` on social-card and metadata-logo responses (a hook, so the `?fallback=` redirects are covered); export-data pages and unnamed exchanges (`Unknown`, `Unknown 0x…`) are `noindex`; `docs` dropped from the static sitemap (it 302s). **After deploy, purge `/social-card/*` and `/metadata-logo/*` in Cloudflare** — successful social cards are cached for a year and edge copies lack the header until purged.
3. **Fonts.** `src/lib/components/css/font-fallbacks.css` (render-blocking, so it applies from the first paint) adds `size-adjust`/`ascent-override`/`descent-override`/`line-gap-override` fallback faces per family; `fonts5.css` became `fonts6.css`, per weight range for the two grotesks, computed with `@capsizecss/core` from the woff2 metrics; the six unused Display 100–300 faces are gone. In the integration harness with fonts delayed by 2 s: token page CLS 0.031 → 0.000, glossary 0.010 → 0.001. `Link` preload headers only on HTML, and the three primary faces on the text-led templates (home, vault, glossary term, token, pair, blog post). The `media="print"` stylesheet trick is kept; measure it separately if LCP on text pages does not move.
4. **Blog.** YouTube iframes become a 16:9 facade (poster + play button) that loads the `youtube-nocookie` player on click; other iframes are lazy. Descriptions cut to 155 characters (Ghost `meta_description` first); `BlogPosting` with `image`, `url`, `mainEntityOfPage` and the site `Organization` as author/publisher.
5. **Caching.** `/logos/**` (a server endpoint, not `static/`) now `public, max-age=604800, stale-while-revalidate=86400`. Fonts and avatars under `static/` are served by adapter-node without cache headers; **set a Cloudflare cache rule** for `/fonts/*.woff2` (one year — the files never change in place; the stylesheet is renamed on change) and `/avatars/*` (one day browser, seven days edge).
6. **Titles, descriptions, social images.** `SocialCardMetaTags` now builds the title with the brand suffix (`getPageTitle`), truncates the description, fills in Open Graph/Twitter defaults, and is used by every indexable template — 30 `<svelte:head><title>` blocks were migrated. Token, pair, exchange and chain pages get data-led descriptions (TVL, volume, pair counts) and the chain social card. Home: `DeFi vault rankings, yields and risk data | Trading Strategy`.
7. **Structured data.** `Organization` (home, `@id` `https://tradingstrategy.ai/#organization`, 512×512 logo at `static/brand-mark-512x512.png`), `BreadcrumbList` JSON-LD on vault detail pages (they render no visible breadcrumb; every other template keeps the microdata from `Breadcrumbs.svelte`).
8. **Lighthouse items.** `maximum-scale=1` removed from the viewport meta; the home hero background is preloaded (one image per viewport via mutually exclusive media queries); strategy avatars carry intrinsic dimensions. The `/vaults` console 404 in the lab is a missing sparkline SVG on the sparkline CDN (`sparkline-90d-4663-0xf37c…svg`) — backend data, nothing in this repository.

Dead code removed on the way: `serializePost()`, the unused Display font faces, the stale font and bundle sections of `docs/speed.md`, the `docs` static-sitemap entry, `MenuItem`'s `href`-less active state (now `aria-current`), Svelte 4 syntax in `MenuItem` and `StrategyIcon`.

### Verification after release

- `curl -sI https://tradingstrategy.ai/social-card/trading-strategy | grep -i x-robots` (after the purge) and `…/fonts/NeueHaasGroteskText/55.woff2 | grep -i cache-control` (after the cache rule).
- PSI mobile on a glossary term and a blog post: no "Web font" CLS culprit, no `youtube.com` request before interaction.
- Rich Results Test on the home page (Organization) and a blog post (BlogPosting).
- Search Console after the next recrawl: social-card URLs leave "Crawled – currently not indexed"; export-data duplicates fall; indexed `/vaults/` URLs stay within ~10 % of today's.
- `pnpm run seo:cwv --history` after 28 days for the field CLS/LCP.
