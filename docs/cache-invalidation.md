# Cache invalidation

## Overview

The frontend uses Cloudflare CDN caching with TTL-based expiration. There is no automatic cache purge on deployment — pages expire naturally based on their `Cache-Control` headers.

## Cache durations by route

| Route                       | TTL     | Notes                              |
| --------------------------- | ------- | ---------------------------------- |
| `/` (landing page)          | 30 min  | Vault data, strategies, blog posts |
| `/trading-view`             | 5 min   |                                    |
| `/trading-view/.../[pair]`  | 30 min  | Trading pair details               |
| `/trading-view/.../[token]` | 30 min  | Token details                      |
| `/blog`, `/blog/[slug]`     | 5 min   | Ghost CMS content                  |
| `/glossary`                 | Dynamic | TTL from server-side cache         |
| Sitemaps (`sitemap*.xml`)   | 10 min  |                                    |

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

## Data freshness

- **Vault data**: The backend API updates vault metrics roughly hourly. The landing page caches for 30 minutes, so vault data is at most ~1.5 hours stale in the worst case.
- **Blog posts**: Ghost CMS webhook could trigger a purge (not currently implemented). Posts appear within 5 minutes of the blog cache TTL.
- **Strategies**: Fetched server-side on each origin request. Cached at the edge for the page TTL.

For page-source diagnostics that expose cache ages and upstream refresh timestamps, see [docs/cache-freshness-diagnostics.md](/Users/moo/code/frontend/docs/cache-freshness-diagnostics.md).
