# Cache invalidation

## Overview

The frontend uses Cloudflare CDN caching with TTL-based expiration. There is no automatic cache purge on deployment — pages expire naturally based on their `Cache-Control` headers.

## Cache durations by route

| Route                                                 | TTL          | Notes                                                                                                                     |
| ----------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `/` (landing page)                                    | 30 min       | Vault data, strategies, blog posts                                                                                        |
| `/trading-view`                                       | 5 min        |                                                                                                                           |
| `/trading-view/.../[pair]`                            | 30 min       | Trading pair details                                                                                                      |
| `/trading-view/.../[token]`                           | 30 min       | Token details                                                                                                             |
| `/blog`, `/blog/[slug]`                               | 5 min        | Ghost CMS content                                                                                                         |
| `/glossary`                                           | Dynamic      | TTL from server-side cache                                                                                                |
| Sitemaps (`sitemap*.xml`)                             | 10 min       |                                                                                                                           |
| `/logos/<type>/<slug>.svg`                            | 24 h         | Bundled SVG logos; the `.svg` extension makes Cloudflare cache them (extensionless URLs are never edge-cached by default) |
| `/vaults/<id>/metrics.bin`                            | 1 h          | Vault chart data; also cached in server memory                                                                            |
| `…/chart-data.bin`                                    | 5 min – 24 h | Chart data; endpoints that set no `Cache-Control` get 24 h                                                                |
| `/social-card/….png`                                  | 24 h         | Share images (vault cards: 24 h + 7 d stale-while-revalidate)                                                             |
| `/metadata-logo/<kind>/<slug>.webp` (`.avif`, `.bin`) | 24 h         | Protocol and stablecoin logos; versioned (`?v=`) URLs 1 year, immutable                                                   |

## Edge-cacheable URLs

Cloudflare's default cache rules cache by file extension only and never cache JSON or extensionless URLs ([default cache behaviour](https://developers.cloudflare.com/cache/concepts/default-cache-behavior/)). Generated images and chart data therefore carry an extension from Cloudflare's default list (`$lib/helpers/edge-cache.ts`):

- share images `/social-card/….png`, protocol and stablecoin logos `/metadata-logo/<kind>/<slug>.webp` (`.avif`, or `.bin` for the upstream original), bundled logos `/logos/<type>/<slug>.svg`;
- JSON chart data `…/chart-data.bin` and `/vaults/<id>/metrics.bin`; `.json` is not cached by default, so `.bin` is used and `Content-Type` stays `application/json`.

The `reroute` hook in `src/hooks.ts` strips the extension before route matching, so the extensionless URLs keep working. `handleResponseHeaders` in `src/hooks.server.ts` sets a 24-hour `Cache-Control` on successful responses to these URLs that set none themselves; endpoints that match a shorter server-side cache (vault comparison 5 min, mini charts and vault metrics 1 h) keep their own.

After deployment, a second request should show `cf-cache-status: HIT`:

```bash
curl -sI "https://tradingstrategy.ai/vaults/historical-tvl-chain/chart-data.bin" | grep -iE "cf-cache-status|cache-control"
```

## Static build assets

SvelteKit build assets under `/_app/immutable/` are content-hashed and served with long-lived immutable cache headers, for example:

```text
cache-control: public, max-age=31536000, immutable
```

This includes the self-hosted ECharts browser bundle emitted from the `echarts` npm package. Because the URL changes when the content changes, these assets are safe for Cloudflare and browsers to cache for a year.

After deployment, verify an emitted ECharts asset through Cloudflare with:

```bash
curl -sI "https://tradingstrategy.ai/_app/immutable/assets/<echarts-file>.js" | grep -i cache-control
```

## Purging the cache

### After a release

Cloudflare cache expires naturally within the TTL windows above. For most releases, no manual purge is needed — the longest TTL is 30 minutes.

If a release includes urgent fixes visible on cached pages, purge manually:

### Cloudflare dashboard

1. Log in to [Cloudflare dashboard](https://dash.cloudflare.com)
2. Select the zone (domain)
3. Go to **Caching** → **Configuration**
4. Under **Purge Cache**:
   - **Purge Everything** — clears all cached content (use for major releases)
   - **Custom Purge** — purge specific URLs (use for targeted fixes)

### Cloudflare API

#### Creating a purge-only API token

You can create a scoped API token that can **only** purge cache (no other permissions):

1. Go to [Cloudflare dashboard → Profile → API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click **Create Token**
3. Select **Create Custom Token**
4. Configure:
   - **Token name**: e.g. `Cache Purge - tradingstrategy.ai`
   - **Permissions**: Zone → **Cache Purge** → **Edit**
   - **Zone Resources**: Include → Specific zone → select your domain
5. Optionally restrict by **Client IP Address Filtering** or set a **TTL** for expiry
6. Click **Continue to summary** → **Create Token**
7. Copy the token — it is shown only once

This token cannot read or modify any other Cloudflare settings.

#### Purge everything:

```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
  -H "Authorization: Bearer {api_token}" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

Purge specific URLs:

```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
  -H "Authorization: Bearer {api_token}" \
  -H "Content-Type: application/json" \
  --data '{"files":["https://tradingstrategy.ai/","https://tradingstrategy.ai/trading-view"]}'
```

### Using wrangler (if installed)

```bash
npx wrangler cache purge --zone {zone_id} --everything
```

## Cloudflare cache rule requirement

By default, Cloudflare marks HTML pages as `cf-cache-status: DYNAMIC` and does **not** cache them at the edge, even if the origin sends a `Cache-Control: public, max-age=N` header. This applies to all SvelteKit-rendered pages.

To enable edge caching, a **Cache Rule** must be configured in the Cloudflare dashboard:

1. Go to **Caching** → **Cache Rules**
2. Create a rule, e.g.:
   - **When**: hostname = `tradingstrategy.ai` AND URI path = `/`
   - **Then**: **Eligible for cache**, Edge TTL override = 1800s (or "Respect origin")
3. Repeat for other routes as needed

Without this rule, every request goes to the origin regardless of the `Cache-Control` header.

### Verifying cache status

```bash
curl -sI https://tradingstrategy.ai/ | grep -i cf-cache-status
```

- `HIT` — served from Cloudflare edge cache
- `MISS` — fetched from origin, now cached for subsequent requests
- `DYNAMIC` — not cached (no cache rule in place)

## How caching works

1. Browser requests a page → hits **Cloudflare edge**
2. Edge has cached response within TTL → serves directly (cache HIT)
3. Edge cache expired → forwards to **origin** (Node.js server)
4. Origin renders the page, sets `Cache-Control` header
5. Cloudflare caches the response and applies **Brotli compression** automatically
6. Subsequent requests within TTL are served from edge

The `Cache-Control: public, max-age=N` header tells Cloudflare how long to cache. The origin server (SvelteKit) sends uncompressed HTML; Cloudflare compresses at the edge.

## Edge-cached pages when the origin is down

An edge-cached page keeps being served by Cloudflare while the Node origin is unreachable, but
only the resources already in that edge's cache are available. Hydration needs the page's
JavaScript chunks (`/_app/immutable/nodes/*.js`); if one of them is not cached at that edge the
request reaches the dead origin and fails.

SvelteKit's reaction to a failed chunk import during hydration is to render its error page,
which needs the root layout's server data (`/__data.json`). That fails too, and SvelteKit falls
back to a full reload of the same URL on the assumption that the origin will render an error
page. With a cached page and a dead origin the reload serves the same HTML, which fails to
hydrate the same way — an infinite reload loop. The chain, as seen in the origin log:

```text
GET /                                          ← cached HTML
GET /_app/immutable/nodes/19.<hash>.js         ← 502
GET /__data.json?x-sveltekit-invalidated=1     ← 502
GET /                                          ← location.href = url, repeat
```

`src/hooks.client.ts` breaks the loop with `$lib/helpers/hydration-reload-guard`: SvelteKit's
first reload is allowed (it resolves transient failures), and a repeat module-load failure of
the same URL within a minute aborts hydration instead, leaving the server-rendered HTML readable
with plain links. Nothing else, including `/_app/version.json`, is fetched during hydration.

## Background cache warmer

Server-side data caches are refreshed by a background job, so a visitor's request never
waits for an upstream download or a chart rebuild once the process has loaded the data.
Before 2026-11 the caches expired and the first visitor after expiry paid for the reload:
the home page took 1–2 s to render on a Cloudflare miss because it downloaded and validated
the whole top-vaults export on every render.

How it works:

- `scripts/server.js` generates a per-process bearer token and runs the scheduler in
  `scripts/cache-scheduler.js`: a tick every 20 minutes, starting at start-up. Every third
  tick (start-up, then hourly) runs the `all` job; the others run `frequent`. Only one job
  runs at a time, and a skipped hourly tick runs on the next tick.
- Each tick is a loopback `POST /_internal/cache/warm?job=…` with the token
  (`src/routes/_internal/cache/warm/+server.ts`). Without the token it answers 401; while a
  job runs, 409. It is not a public cache-control API.
- The tasks and their order are in `src/lib/server/warm-tasks.ts`; they run one after
  another (`src/lib/server/cache-warmer.ts`). A task past its deadline is aborted and the job
  moves on, but the task is not started again until it has really stopped.
- The caches are `createWarmCache()` instances (`src/lib/server/warm-cache.ts`): they serve
  the current value, reload single-flight, keep the previous value when a reload fails, back
  off from a failing source (15 s doubling to 30 min), and fall back to a background reload
  from a request only when a value is twice its interval old (the warmer is not running).
  Loaders throw on failure; they must not return an empty result.

| Task (`all` job, in order) | Cache                                                       | Interval |
| -------------------------- | ----------------------------------------------------------- | -------- |
| `reference-rates`          | FRED savings and Treasury rates (`swrCache`, 2 days)        | 2 days   |
| `top-vaults`               | `top-vaults` export                                         | 1 h      |
| `crypto-vaults`            | `crypto-vaults` export (curator BTC/ETH tables)             | 1 h      |
| `stablecoin-metadata`      | `stablecoin-metadata` index                                 | 2 h      |
| `vault-protocol-metadata`  | metadata of every protocol in the export                    | 1 h      |
| `search-index`             | vault search index (rebuilt when its inputs change)         | —        |
| `chart-caches`             | every route chart cache requested since start-up (see note) | 1–24 h   |
| `home-blog-posts`          | home page blog roll (also in `frequent`)                    | 20 min   |
| `strategies-page`          | `/strategies` snapshot (also in `frequent`)                 | 20 min   |

Chart caches (`/top-vaults/chart-data`, hub mini charts, historical TVL, CORE3, heatmap)
are created inside their route modules, which SvelteKit loads on the first request, so
they are warmed from their first request on. Keyed chart caches drop groups nobody has read
for a day instead of rescanning the parquet for them. Not warmed: per-vault
`/vaults/<id>/metrics` (thousands of vaults; an in-memory LRU plus the 1 h edge cache) and
responses keyed by arbitrary query strings (`/vaults/compare/chart-data`).

Each job's response, and the container log line prefixed `[cache-warmer]`, lists every
task's status, duration, longest event-loop stall and RSS. Measured on 2026-11-22 against
production data (local production build): a full `all` job took 22–28 s, mostly network
(protocol metadata 12–18 s for ~100 protocols, top-vaults 4.3 s, crypto export 4.9 s); the
longest event-loop stall in any task was 33 ms, so the parsing does not need a worker
thread. RSS peaked at 1.4 GB while the crypto export was parsed and settled at about 0.8 GB;
during an hourly refresh the old and new copy of an export are briefly both in memory.
After the warm, `/` rendered in 9 ms and the Morpho hub in 40 ms at the origin. The per-cache state (age, source
age, last load time, failures, last error) is on `/diagnostics` for admins (`?pw=`). Under
`pnpm run dev` there is no scheduler; caches load on first use.

## Data freshness

- **Vault data**: The backend API updates vault metrics roughly hourly, and the warmer reloads the export hourly. Worst case on the landing page: ~1 h upstream + 1 h in the process + 30 min at the edge. A source older than 6 h shows as `degraded` on `/diagnostics`.
- **Blog posts**: The home page blog roll is reloaded every 20 minutes, so a new post appears there within ~50 minutes (20 min in the process + 30 min edge). Blog pages themselves use the 5-minute blog cache TTL. A Ghost webhook purge is not implemented.
- **Strategies**: `/strategies` uses its own snapshot, refreshed every 20 minutes; API strategy metadata elsewhere is a 60-second `swrCache`.

For page-source diagnostics that expose cache ages and upstream refresh timestamps, see [docs/cache-freshness-diagnostics.md](/Users/moo/code/frontend/docs/cache-freshness-diagnostics.md).
