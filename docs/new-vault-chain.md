# Adding a new vault chain

Checklist for integrating a new blockchain into the vault system.

## 1. Chain registry

Add an entry to the `chains` array in `src/lib/helpers/chain.ts`:

```typescript
{
  id: 9998,            // numeric chain ID
  slug: 'lighter',     // URL-friendly slug (used in routes and logo lookup)
  name: 'Lighter',     // human-readable display name
  homepage: 'https://lighter.xyz',
  explorer: 'https://scan.lighter.xyz',
  nativeCurrency: 'ETH',
  hasBackendData: false // true only if the chain has full backend oracle/price data
}
```

- Chains sharing a slug (e.g. HyperEVM 999 and HyperCore 9999 both use `'hyperliquid'`) are grouped together in listings and statistics.
- Set `sortOrder` only for fully supported chains that should appear in a fixed order.

## 2. Chain logo

Add an SVG logo to `src/lib/assets/logos/blockchains/{slug}.svg`.

The filename must match the chain's `slug` value. Logos are served via the `/logos/blockchains/{slug}` endpoint (see `src/lib/helpers/assets.ts`).

## 3. Vault ID param matcher

Update the regex in `src/params/vaultId.ts` to accept the new chain's vault ID format.

Each chain may use a different ID format in the vault data:

| Chain                      | Format                            | Example                             |
| -------------------------- | --------------------------------- | ----------------------------------- |
| EVM (Ethereum, Base, etc.) | `{chainId}-0x{hex}`               | `1-0xabc123...`                     |
| HyperCore / GRVT           | `{chainId}-vlt:{id}`              | `325-vlt:38t5xhy...`                |
| Lighter                    | `{chainId}-lighter-pool-{number}` | `9998-lighter-pool-281474976625478` |

Add a new alternative to the regex group:

```typescript
return /^\d+-(0x[0-9a-f]+|vlt:[0-9a-z]+|lighter-pool-\d+)$/i.test(param);
```

**If you skip this step**, the vault detail page will load but the share price chart will return 404 (the metrics endpoint route won't match).

## 4. Risk filter compatibility

Vaults with `risk_numeric: null` (common for new chains without risk scoring) must not be silently excluded by the risk filter in `src/lib/top-vaults/TopVaultsTable.svelte`. The filter should treat `null` risk as "unrated" and include those vaults. See the filter logic around line 160.

## 5. TVL threshold overrides (optional)

If the new chain's vaults need a different default TVL threshold, add an entry to:

- `CHAIN_TVL_THRESHOLD_OVERRIDES` map in `src/lib/top-vaults/helpers.ts` (affects `meetsDefaultTvl` used on the front page)
- `chainOverrides` in the `tvlFilterOptions` array in the same file (affects the interactive filter on `/trading-view/vaults`)

## 6. Parquet data

Vault share price chart data is served from `data/cleaned-vault-prices-1h.parquet`. The metrics endpoint (`src/routes/trading-view/vaults/[vault=vaultId]/metrics/+server.ts`) queries this file by vault ID.

Ensure the parquet file is updated to include rows for the new chain's vaults. Without this, the chart will render empty (no error shown to the user).

## 7. Verification

After adding a new chain, verify:

- [ ] Chain logo appears on the blockchains page (`/trading-view/blockchains`)
- [ ] Vaults appear in the listing (`/trading-view/vaults`) — try the search box and lower TVL filters
- [ ] Vault detail page loads (`/trading-view/vaults/{slug}`)
- [ ] Share price chart shows data on the vault detail page
- [ ] Chain appears in the "by chain" vault grouping (`/trading-view/vaults/chains`)
