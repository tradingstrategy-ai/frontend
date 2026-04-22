# Vault data sources

The frontend consumes two server-side vault datasets. Both are produced by the backend pipeline and stored in a private Cloudflare R2 bucket.

## Datasets

| Dataset              | R2 object key                     | Local cache path                       | Used by                                                  |
| -------------------- | --------------------------------- | -------------------------------------- | -------------------------------------------------------- |
| Top vaults JSON      | `top_vaults_by_chain.json`        | In-memory (SWR cache)                  | Vault listings, landing page, vault detail pages         |
| Vault prices parquet | `cleaned-vault-prices-1h.parquet` | `data/cleaned-vault-prices-1h.parquet` | Share price chart, TVL charts, historical TVL aggregates |

## Configuration

### Recommended: private R2 bucket credentials

Set these four variables in `.env.local`. This is the canonical access method — both datasets are served from the same bucket.

```env
TS_PRIVATE_R2_ACCOUNT_ID="<cloudflare-account-id>"
TS_PRIVATE_R2_ACCESS_KEY_ID="<r2-access-key>"
TS_PRIVATE_R2_SECRET_ACCESS_KEY="<r2-secret-key>"
TS_PRIVATE_R2_BUCKET_NAME="vaults-pro-data"
```

The R2 client (`src/lib/r2/client.ts`) uses the S3-compatible API via `@aws-sdk/client-s3`.

### Fallback: direct URLs

If R2 credentials are unavailable, each dataset can be configured with a direct URL independently:

| Variable                              | Dataset              | Notes                          |
| ------------------------------------- | -------------------- | ------------------------------ |
| `TS_PRIVATE_TOP_VAULTS_URL`           | Top vaults JSON      | Used when R2 is not configured |
| `TS_PRIVATE_VAULT_PRICES_PARQUET_URL` | Vault prices parquet | Used when R2 is not configured |

## How each dataset is fetched

### Top vaults JSON

**Code:** `src/lib/top-vaults/server-config.ts` → `fetchTopVaultsRaw()`

1. If R2 is configured → fetch via `getR2Object('top_vaults_by_chain.json')`
2. If R2 fails or is not configured → fall back to `TS_PRIVATE_TOP_VAULTS_URL`
3. If neither is available → throws error

The response is parsed, validated against the Zod schema, and cached in memory with SWR (stale-while-revalidate) via `src/lib/top-vaults/cache.ts`.

### Vault prices parquet

**Code:** `src/lib/top-vaults/vault-prices-parquet.ts` → `ensureVaultPricesParquet()`

1. If the local file (`data/cleaned-vault-prices-1h.parquet`) exists and is less than 1 hour old → use it directly
2. If the file is stale or missing → resolve a remote source and download:
   - `TS_PRIVATE_VAULT_PRICES_PARQUET_URL` if set (takes precedence — also used by tests to inject a mock)
   - Otherwise R2 if credentials are configured
3. If neither URL nor R2 is available → throws error (unless a local file already exists, in which case the stale copy is used)
4. Change detection uses ETag / Last-Modified / Content-Length from HEAD requests (URL path) or HeadObject (R2 path)
5. Downloads are atomic (write to temp file, then rename)
6. Concurrent callers share a single in-flight download

R2 downloads stream the object body via the AWS SDK (`getR2Object`) and pipe it to disk using Node.js `stream.pipeline`. URL downloads use `fetch` with a 5-minute timeout.

### Datasets download endpoint

**Code:** `src/routes/trading-view/vaults/datasets/download/[datasetId]/+server.ts`

This public-facing endpoint proxies downloads through a separate Vault API service (`TS_PUBLIC_VAULT_API_URL`), not through R2 or the local cache. It is used by the datasets listing page for user-facing downloads.

The datasets listing page (`src/routes/trading-view/vaults/datasets/+page.server.ts`) requires R2 to be configured for displaying file metadata (size, last modified), even though the actual download goes through the Vault API.

## Data flow diagram

```
R2 bucket (vaults-pro-data)
├── top_vaults_by_chain.json
│   └─→ server-config.ts (R2 SDK, URL fallback)
│       ─→ cache.ts (SWR in-memory) ─→ page loaders
│
└── cleaned-vault-prices-1h.parquet
    └─→ vault-prices-parquet.ts (URL if set, else R2 SDK)
        ─→ local file cache (1h TTL)
        ├─→ /vaults/[vault]/metrics endpoint (DuckDB query)
        └─→ historical-tvl-server.ts (DuckDB aggregate)
```

## Consumers

| Consumer                         | Dataset              | Code path                                                 |
| -------------------------------- | -------------------- | --------------------------------------------------------- |
| Vault detail page (server load)  | Top vaults JSON      | `+page.server.ts` → `getCachedTopVaults()`                |
| Landing page (server load)       | Top vaults JSON      | `+page.server.ts` → `getCachedTopVaults()`                |
| Vault price chart (client fetch) | Parquet              | `/vaults/[vault]/metrics` → `ensureVaultPricesParquet()`  |
| Historical TVL charts (server)   | Parquet              | `historical-tvl-server.ts` → `ensureVaultPricesParquet()` |
| Datasets listing page            | Both (metadata only) | `headTopVaults()` + `headVaultPrices()` via R2            |
| Datasets download                | Both (proxied)       | `/datasets/download/[datasetId]` via Vault API            |

## Known issues

1. **Datasets page error message is misleading.** The datasets listing page throws "R2 credentials missing" if R2 is not configured, but the actual download endpoint uses the Vault API, not R2. R2 is only needed for the metadata display.

## Local development

For local development, ensure R2 credentials are set in `.env.local`. Both datasets will be fetched automatically:

- Top vaults JSON is fetched on first page load and cached in memory
- Vault prices parquet (~150 MB) is downloaded on first metrics request and cached locally with a 1-hour refresh interval
