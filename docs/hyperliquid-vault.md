# YAML-configured strategies

This document explains how to add strategy entries to the `/strategies` listing without a trade-executor backend API, using YAML configuration files that point to existing vault data.

## Background: two approaches

### Trade-executor API strategies (legacy)

The original approach requires a running trade-executor instance for each strategy. The frontend discovers these via the `TS_PUBLIC_STRATEGIES` environment variable, which lists strategy IDs and their backend URLs:

```json
[
	{
		"id": "enzyme-polygon-matic-usdc",
		"name": "MATIC-USD breakout on Uniswap v3",
		"url": "https://trade-executor-api.example.com/enzyme-polygon-matic-usdc"
	}
]
```

The frontend fetches live data (positions, performance, trade history) from each backend. These strategies get the full set of subpages: overview, positions, performance, vault, fees, netflow, backtest, source code, and tech details.

### YAML-configured strategies

YAML strategies have no backend. They are defined by a YAML file in `strategies/` and pull live metrics (TVL, returns, fees) from the vault browsing API (`TS_PUBLIC_TOP_VAULTS_URL`). These strategies get a single overview page with vault metrics and a link to the full vault detail page.

This is useful for vaults (e.g., Hyperliquid vaults) where there is no trade-executor instance but you still want the strategy to appear in the `/strategies` listing and optionally on the frontpage.

## How it works

### Routing

SvelteKit param matchers separate the two strategy types under the same `/strategies/` URL prefix:

- `src/params/apiStrategy.ts` — matches IDs found in `TS_PUBLIC_STRATEGIES`
- `src/params/yamlStrategy.ts` — matches slugs found in the YAML config files

Each request to `/strategies/{id}` is checked against both matchers. Only one will match (the ID sets are disjoint), routing to the correct page tree.

### YAML config loading

At build time, `src/lib/strategies/yaml/loader.ts` uses Vite's `import.meta.glob` to load `.yaml` files. The source directory depends on the build mode:

- **Production** (`pnpm run build`): loads from `strategies/` at the project root
- **Test** (`pnpm run build --mode=test`): loads from `tests/strategies/`

This separation ensures integration tests don't depend on production config contents. Each file is parsed with `js-yaml` using `JSON_SCHEMA` (resolves booleans, numbers, and null natively, without the dangerous implicit coercions of the default schema), then validated with Zod.

### Vault data

The `vault_address` field in each YAML config links the strategy to a vault from the vault browsing API. At runtime, the frontend fetches vault data via `fetchTopVaults()` and matches by on-chain address to populate metrics like TVL, returns, and fees. Using the address rather than the vault slug ensures the binding remains stable even if the vault is renamed.

## Configuration reference

Each YAML strategy file has the following fields:

| Field               | Required | Description                                              |
| ------------------- | -------- | -------------------------------------------------------- |
| `id`                | yes      | Internal identifier for the strategy                     |
| `slug`              | yes      | URL slug used in `/strategies/{slug}`                    |
| `name`              | yes      | Display name                                             |
| `short_description` | yes      | One-line summary shown in listing tiles                  |
| `long_description`  | no       | Markdown description shown on the description subpage    |
| `icon_url`          | no       | URL or path to strategy icon (overrides convention)      |
| `vault_address`     | yes      | On-chain vault address (stable across renames)           |
| `external_url`      | no       | External vault URL for the "My deposits" widget          |
| `chain_id`          | yes      | Blockchain chain ID                                      |
| `tags`              | no       | Array of tags; include `live` for public visibility      |
| `sort_priority`     | no       | Higher values appear first in the listing (default: `0`) |
| `frontpage`         | no       | Set to `true` to show on the homepage (default: `false`) |

Use native YAML types for numbers and booleans (e.g., `chain_id: 9999`, `frontpage: true`). String values like `vault_address` and `external_url` should be quoted.

### Strategy icon

The strategy icon is resolved in order:

1. **`icon_url`** in the YAML config — use this to point to an external URL or a custom path
2. **`/avatars/{slug}.webp`** — convention-based fallback; place a `.webp` image in `static/avatars/` named after the strategy slug

For example, a strategy with `slug: ichi-hyperliquid` automatically uses `static/avatars/ichi-hyperliquid.webp` if no `icon_url` is set. This matches the same convention used by trade-executor API strategies.

The icon appears in the strategy listing tiles, the frontpage featured section, and the strategy detail page heading.

## Example: ICHI v3 strategy on the local test server

The repository includes an example YAML strategy that works with the integration test mock data.

### 1. YAML config file

`tests/strategies/trading-strategy-ichiv3-ls-2.yaml`:

```yaml
id: trading-strategy-ichiv3-ls-2
slug: trading-strategy-ichiv3-ls-2
name: ICHI v3 Liquidity Strategy
short_description: Automated liquidity provision using ICHI v3 vaults
vault_address: '0x1234567890abcdef1234567890abcdef12345678'
chain_id: 9999
tags:
  - live
sort_priority: 5
frontpage: true
```

### 2. What each field does in this example

- **`slug: trading-strategy-ichiv3-ls-2`** — the URL will be `/strategies/trading-strategy-ichiv3-ls-2`
- **`vault_address: '0x1234...'`** — matches the vault address in the mock vault data served by the test server
- **`tags: [live]`** — visible to non-admin users
- **`sort_priority: 5`** — appears after higher-priority strategies in the listing
- **`frontpage: true`** — appears in the featured strategies section on the homepage

### 3. Running the test server

The local test server uses mock API responses defined in `tests/mocks/`. The vault data mock at `tests/mocks/top-vaults/list.mock.ts` includes a vault with address `0x1234567890abcdef1234567890abcdef12345678` that provides the metrics displayed on the strategy page.

To build and run the test server:

```sh
pnpm run build --mode=test
pnpm run preview -- --mode=test
```

Then visit:

- `http://localhost:4173/strategies` — the ICHI strategy appears in the listing
- `http://localhost:4173/strategies/trading-strategy-ichiv3-ls-2` — the overview page with vault metrics
- `http://localhost:4173/` — the ICHI strategy appears in the frontpage featured strategies

### 4. Running integration tests

```sh
pnpm run test:integration
```

The relevant test files are:

- `tests/integration/strategies/yaml-strategy.test.ts` — listing and detail page tests
- `tests/integration/yaml-strategy-frontpage.test.ts` — frontpage display tests

## Adding a new YAML strategy

1. Create a new YAML file in `strategies/`, e.g., `my-strategy-hyperliquid.yaml`
2. Set `slug` to the desired URL path segment (used in `/strategies/{slug}`)
3. Set `vault_address` to the on-chain address of the vault
4. Place a `.webp` icon image at `static/avatars/{slug}.webp` (or set `icon_url` in the config)
5. Optionally set `external_url` to the vault's page on the external protocol (e.g., Hyperliquid app) — this enables the "My deposits" widget with a link to the external app
6. Add `tags: [live]` when ready for public visibility
7. Set `frontpage: true` if it should appear on the homepage
8. Rebuild — the strategy is picked up automatically at build time via `import.meta.glob`
