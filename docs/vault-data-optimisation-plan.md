# Vault data optimisation plan

## Context

The landing page vault data was optimised in PR #1171 by pre-computing aggregates server-side and lazy-loading chart data. Several other routes still fetch and embed full 80+ field vault objects in HTML. This document outlines the next steps.

## Completed (PR #1171)

- Landing page embeds only top 30 slim vaults + pre-computed aggregates (~15 KB vs ~1.3 MB)
- `/top-vaults/chart-data` endpoint with in-memory Brotli cache (2h TTL)
- Integration tests for compressed/uncompressed responses

## Candidates for optimisation

### 1. `/trading-view/vaults/+layout.ts` (highest impact)

Central hub for all vault listing pages (~15 child routes). Currently fetches full `VaultInfo[]` (80+ fields per vault) and passes it to every child.

**Child routes and their data needs:**

| Route                                  | Needs full VaultInfo? | Notes                                           |
| -------------------------------------- | --------------------- | ----------------------------------------------- |
| `/protocols/+page.ts`                  | No                    | Groups by protocol, computes TVL/APY aggregates |
| `/stablecoins/+page.ts`                | No                    | Groups by denomination                          |
| `/chains/+page.ts`                     | No                    | Groups by chain                                 |
| `/protocols/[protocol]/+page.ts`       | Partial               | Lists vaults in a protocol, uses ~15 fields     |
| `/stablecoins/[denomination]/+page.ts` | Partial               | Lists vaults in a denomination                  |
| `/chains/[chain]/+page.ts`             | Partial               | Lists vaults in a chain                         |
| `/[vault=slug]/+page.ts`               | Yes                   | Detail page needs all fields                    |
| `/current-peak-tvl/+page.ts`           | No (ssr=false)        | Client-only chart, could lazy-fetch             |
| `/yield-protocol/+page.ts`             | No (ssr=false)        | Client-only chart                               |
| `/yield-chain/+page.ts`                | No (ssr=false)        | Client-only chart                               |
| `/yield-risk/+page.ts`                 | No (ssr=false)        | Client-only chart                               |
| `/cumulative-tvl-apy/+page.ts`         | No (ssr=false)        | Client-only chart                               |

**Approach:**

- Layout fetches slim vault data (reuse `/top-vaults/chart-data` endpoint or in-memory cache)
- Vault detail page (`/[vault=slug]`) fetches full data for a single vault separately
- Chart pages (ssr=false) lazy-fetch from the chart-data endpoint

### 2. `/trading-view/[chain=slug]/+page.ts` (medium impact)

Fetches all vaults, filters by `chain_id`, embeds full objects. Could:

- Use slim data from the cached endpoint
- Filter server-side and return only matching chain vaults

### 3. `/trading-view/+page.ts` (low impact)

Simple pass-through of full vault data. Could use slim data.

### 4. `/strategies/+page.server.ts` (low impact)

Fetches full vaults only to match YAML strategies by `address`. Could:

- Keep current approach (already server-only, not embedded in HTML)
- Or fetch only the fields needed for matching (`address`, `id`)

## Implementation notes

- The `/top-vaults/chart-data` endpoint already has an in-memory cache with 2h TTL and Brotli pre-compression. Other server-side code could import the same caching function rather than creating a new endpoint.
- The vault detail page is the only route that genuinely needs full `VaultInfo`. All listing/summary views work with `SlimVaultInfo`.
- Chart pages with `ssr=false` don't embed data in HTML at all — they fetch client-side. These could use the chart-data endpoint directly.
