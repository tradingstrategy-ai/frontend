# Vault data sources

The frontend reads two server-side vault datasets and one external reference rate. The vault datasets are produced by the backend pipeline and stored in a private Cloudflare R2 bucket. The browser never reads the private R2 source directly.

## Datasets

| Dataset              | Source                                | Local cache path                        | Used by                                                  |
| -------------------- | ------------------------------------- | --------------------------------------- | -------------------------------------------------------- |
| Top vaults JSON      | R2: `top_vaults_by_chain.json`        | In-memory (1-hour TTL)                  | Vault pages, strategy metadata, search, and summaries    |
| Vault prices parquet | R2: `cleaned-vault-prices-1h.parquet` | `data/cleaned-vault-prices-1h.parquet`  | Share price chart, TVL charts, historical TVL aggregates |
| Treasury benchmark   | FRED CSV: `DTB3` series               | `~/.cache/ts-frontend/fred-DTB3-*.json` | US 3M T-bill benchmark line on non-perp vault charts     |

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

The server parses, validates, normalises, and caches the response in memory for one hour via `src/lib/top-vaults/cache.ts`. When the cache expires, the next request waits for a fresh export; there is no stale-while-revalidate behaviour.

#### Browser delivery

The complete `TopVaults` export stays in server memory for normal application pages. A server load does not by itself prevent exposure: SvelteKit serialises everything it returns as page data, so loaders must explicitly project the cached export into the response needed by the browser.

Current browser-facing projections are:

- Vault listings return at most 125 initial full records and up to 50 records per continuation request.
- Vault detail pages return one matched full record and only its related metadata.
- Strategy position pages return only records matching the requested vault IDs or chain/address pairs.
- `/trading-view/[chain]` returns a vault count, latest block, and latest update time calculated across the chain IDs represented by the route slug.
- Group, index, search, and chart routes return calculated rows, suggestions, points, or series.

The following chart endpoints return only the points, grouping, labels, and links needed to render their chart:

- `/vaults/yield-risk/chart-data`
- `/vaults/yield-chain/chart-data`
- `/vaults/yield-protocol/chart-data`
- `/vaults/current-peak-tvl/chart-data`
- `/vaults/cumulative-tvl-apy/chart-data`

The public `/top-vaults/chart-data` endpoint remains for the landing-page chart, diagnostics, and the server-side pricing fallback. It contains every vault but only the `SlimVaultInfo` fields. The legacy unrestricted complete-export endpoint has been removed.

#### Off-chain USD denomination

The frontend presents every raw `USD` accounting denomination as `USD (offchain)` with the `usd-offchain` slug. This includes Kinexys vaults, whose source data can instead expose a USDC settlement-token address. The normalisation happens in `src/lib/top-vaults/client.ts` before any server page, listing, or chart builder consumes the dataset. Despite the historical filename, this module is server-only because its dependency chain reads private runtime configuration. It groups all off-chain USD accounting balances together and prevents them from being presented as an on-chain stablecoin token.

#### Unknown protocol identity

The source export has used several values when it cannot identify a vault's underlying protocol: empty fields, angle-bracket placeholders, the literal `Unknown`, and generic or legacy slugs such as `erc-4626`. The frontend does not interpret these as evidence that a known protocol is unsupported. It classifies them as unidentified source records.

`isUnknownVaultProtocol()` is the single classification path for both full vault records and slug-only consumers such as protocol-logo lookup. An explicit unknown value in either source field takes precedence, while a blank slug does not erase a recognised protocol name. During `fetchTopVaults()`, `normaliseVaultProtocol()` rewrites every recognised variant to the display name `Unknown vault protocol` and the canonical slug `unknown`. All page loaders, filters, charts, search results, metadata requests, and detail-page links therefore consume the same identity. Previously published routes using a recognised legacy placeholder slug permanently redirect to `/vaults/protocols/unknown`.

#### Whitelist status

Each vault may include a `whitelist` object that records whether deposits are publicly available:

| Status           | Meaning in the frontend                                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `whitelisted`    | The depositor needs permission. The vault is labelled **Private** and the detail page warns that it does not accept public deposits. |
| `permissionless` | The vault accepts public deposits.                                                                                                   |
| `unknown`        | The source could not determine the deposit-permission status.                                                                        |

The frontend treats unrecognised source values as `unknown`, and preserves optional `whitelist.notes` in the vault's Technical details table.

#### Deposit availability and capacity

`deposit_closed_reason` is the source of truth for whether deposits may be unavailable. The listing and vault detail page show the source message in Technical details. For a compact status label, the frontend displays **Capped** only when the reason contains a case-insensitive `deposit cap ... reached` confirmation. This recognises the current standard and Upshift forms:

- `Max deposit cap reached (maxDeposit=0)`; or
- the equivalent Upshift wording, `depositCap() has been reached`.

Other reasons, including high utilisation or permissioning, remain their source-provided status rather than being inferred as a cap.

#### Detail-page risk summaries

The vault detail page's **Other metrics** card shows one third-party provider result when it is available. A vault-level or protocol-level Xerberus assessment takes precedence and is shown as **Xerberus risk**. Its score is displayed as `score / 100`; higher scores indicate a stronger rating (lower estimated risk), so it is not a Probability of Loss percentage. The score tooltip states whether Xerberus assessed the vault directly or its underlying protocol.

When no Xerberus assessment is available, the card uses the resolved CORE3 protocol rating as **CORE3 risk**. CORE3 uses credit-style labels from AA (lowest Probability of Loss) to D (highest). If neither provider has data, the card falls back to the frontend's protocol technical-risk classification.

The full Xerberus and CORE3 cards remain below the vault-information cards. Transaction availability is shown after those provider cards so restrictions and their corresponding risk context remain together.

Protocol pages and the protocol listing also resolve Xerberus scores from these embedded vault assessments. They do not make requests to Xerberus APIs.

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

### Treasury benchmark (FRED DTB3)

**Code:** `src/routes/vaults/treasury-benchmark/+server.ts` (server proxy) and `src/lib/top-vaults/treasury-benchmark.ts` (client fetcher)

The US 3-month Treasury bill rate is used as a risk-free benchmark on non-perpetual-futures vault charts. FRED blocks browser CORS and rate-limits aggressively, so the data is proxied through a server endpoint.

**Server endpoint** (`/vaults/treasury-benchmark?cosd=YYYY-MM-DD&coed=YYYY-MM-DD`):

1. Validates and clamps date range (rejects future `cosd`, clamps to DTB3 series bounds)
2. Checks file cache at `~/.cache/ts-frontend/fred-DTB3-{cosd}-{coed}.json` (24h TTL)
3. If stale or missing → fetches from `https://fred.stlouisfed.org/graph/fredgraph.csv`
4. On fetch failure → returns stale cache if available, otherwise 502
5. Uses User-Agent rotation (FRED blocks bare Node.js requests)

**Client module** (`treasury-benchmark.ts`):

- `fetchTreasuryBenchmarkSeries()` — fetches from the proxy with 7-day seed window for weekend starts
- `ratesToCumulativeReturn()` — converts daily annual yields to a cumulative price line using time-correct compounding: `value = prevValue * (1 + rate/100) ^ (elapsedMs / YEAR_MS)`
- Outputs interval-aligned points (4h for 1M view, 1d for 3M/Max) with `customValues` metadata for tooltip display

**Shared helpers** (`src/lib/fred-helpers.ts` — server-only):

- `randomUserAgent()` — Firefox UA rotation for FRED requests
- `isValidDateString()` — strict YYYY-MM-DD validation with round-trip check
- `readJsonFileCache()` / `writeJsonFileCache()` / `isCacheFresh()` — generic file cache with injectable `cacheDir` for testing

**Vault price-chart benchmark classification** (`src/lib/top-vaults/vault-price-benchmarks.ts`):

- Perpetual futures vaults show BTC/ETH benchmarks (via Coinbase API)
- Crypto-exposed GMX pools show BTC/ETH benchmarks, except GM BTC and ETH pools, which show their respective market benchmark only
- Stable-stable GMX GM swap pools show the US 3M T-bill benchmark
- All remaining vaults show the US 3M T-bill benchmark
- Perpetual futures detection: `perp_dex_trading_vault` flag first, then chain_id fallback (9999 HyperCore, 325 GRVT, 9998 Lighter, 9997 Hibachi)
- HyperEVM (chain_id 999) is intentionally excluded — it hosts DeFi/lending vaults

### Datasets download endpoint

**Code:** `src/routes/vaults/datasets/download/[datasetId]/+server.ts`

This authenticated download endpoint proxies requests through a separate Vault API service (`TS_PUBLIC_VAULT_API_URL`), not through R2 or the local cache. It requires an API key and intentionally streams the complete licensed dataset as a file download.

The datasets listing page (`src/routes/vaults/datasets/+page.server.ts`) reads top-vault file metadata from R2 or the configured private URL fallback. Historical parquet file metadata is available only through R2. The actual downloads use the separate Vault API in both cases.

## Data flow diagram

```
R2 bucket (vaults-pro-data)
├── top_vaults_by_chain.json
│   └─→ server-config.ts (R2 SDK, URL fallback)
│       ─→ client.ts (presentation normalisation) ─→ cache.ts (1-hour in-memory) ─→ page loaders
│
└── cleaned-vault-prices-1h.parquet
    └─→ vault-prices-parquet.ts (URL if set, else R2 SDK)
        ─→ local file cache (1h TTL)
        ├─→ /vaults/[vault]/metrics endpoint (DuckDB query)
        └─→ historical-tvl-server.ts (DuckDB aggregate)

FRED (fred.stlouisfed.org)
└── DTB3 (3-month T-bill rate)
    └─→ /vaults/treasury-benchmark endpoint (server proxy)
        ─→ file cache (~/.cache/ts-frontend/, 24h TTL)
        └─→ TreasuryBenchmarkSeries.svelte (client component)
            ─→ ratesToCumulativeReturn() ─→ chart line overlay
```

## Consumers

| Consumer                           | Dataset              | Code path                                                       |
| ---------------------------------- | -------------------- | --------------------------------------------------------------- |
| Vault detail page (server load)    | Top vaults JSON      | `+page.server.ts` → `getCachedTopVaults()`                      |
| Landing page (server load)         | Top vaults JSON      | `+page.server.ts` → `getCachedTopVaults()`                      |
| Chain overview summary             | Top vaults JSON      | `trading-view/[chain]/+page.server.ts` → calculated scalars     |
| Strategy vault metadata            | Top vaults JSON      | Server loads or `/strategies/position-vault-data` matches       |
| Vault price chart (client fetch)   | Parquet              | `/vaults/[vault]/metrics` → `ensureVaultPricesParquet()`        |
| Historical TVL charts (server)     | Parquet              | `historical-tvl-server.ts` → `ensureVaultPricesParquet()`       |
| T-bill benchmark (other vaults)    | FRED DTB3            | `TreasuryBenchmarkSeries.svelte` → `/vaults/treasury-benchmark` |
| BTC/ETH benchmarks (perps and GMX) | Coinbase API         | `CoinbaseBenchmarkSeries.svelte` → `coinbase.ts`                |
| Datasets listing page              | Both (metadata only) | `headTopVaults()` + `headVaultPrices()`                         |
| Datasets download                  | Both (proxied)       | `/datasets/download/[datasetId]` via Vault API                  |

## Known issues

1. Dataset metadata availability differs from download availability. The listing may omit file size or modification time when the corresponding private metadata source is unavailable, while authenticated downloads can still work through the Vault API.

## Local development

For local development, ensure R2 credentials are set in `.env.local`. All data sources will work automatically:

- Top vaults JSON is fetched on first page load and cached in memory for 1 hour
- Vault prices parquet (~150 MB) is downloaded on first metrics request and cached locally with a 1-hour refresh interval
- Treasury benchmark data is fetched from FRED on demand (no credentials needed) and cached for 24 hours

When developing from a git worktree, `.env.local` and `data/` are ignored local files and are not
created automatically. Symlink or copy them from the main checkout before starting the dev server;
see [worktree setup](../.claude/docs/worktree.md).
