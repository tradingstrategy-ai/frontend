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

## How caching works

1. Browser requests a page → hits **Cloudflare edge**
2. Edge has cached response within TTL → serves directly (cache HIT)
3. Edge cache expired → forwards to **origin** (Node.js server)
4. Origin renders the page, sets `Cache-Control` header
5. Cloudflare caches the response and applies **Brotli compression** automatically
6. Subsequent requests within TTL are served from edge

The `Cache-Control: public, max-age=N` header tells Cloudflare how long to cache. The origin server (SvelteKit) sends uncompressed HTML; Cloudflare compresses at the edge.

## Data freshness

- **Vault data**: The backend API updates vault metrics roughly hourly. The landing page caches for 30 minutes, so vault data is at most ~1.5 hours stale in the worst case.
- **Blog posts**: Ghost CMS webhook could trigger a purge (not currently implemented). Posts appear within 5 minutes of the blog cache TTL.
- **Strategies**: Fetched server-side on each origin request. Cached at the edge for the page TTL.
