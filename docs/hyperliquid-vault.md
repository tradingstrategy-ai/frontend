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

YAML strategies have no backend. They are defined by a YAML file in `src/lib/strategies/yaml/configs/` and pull live metrics (TVL, returns, fees) from the vault browsing API (`TS_PUBLIC_TOP_VAULTS_URL`). These strategies get a single overview page with vault metrics and a link to the full vault detail page.

This is useful for vaults (e.g., Hyperliquid vaults) where there is no trade-executor instance but you still want the strategy to appear in the `/strategies` listing and optionally on the frontpage.

## How it works

### Routing

SvelteKit param matchers separate the two strategy types under the same `/strategies/` URL prefix:

- `src/params/apiStrategy.ts` — matches IDs found in `TS_PUBLIC_STRATEGIES`
- `src/params/yamlStrategy.ts` — matches IDs found in the YAML config files

Each request to `/strategies/{id}` is checked against both matchers. Only one will match (the ID sets are disjoint), routing to the correct page tree.

### YAML config loading

At build time, `src/lib/strategies/yaml/loader.ts` uses Vite's `import.meta.glob` to load all `.yaml` files from `src/lib/strategies/yaml/configs/`. Each file is parsed with `js-yaml` using `FAILSAFE_SCHEMA` (all values treated as strings — no implicit type coercion), then validated with Zod.

### Vault data

The `vault_slug` field in each YAML config links the strategy to a vault from the vault browsing API. At runtime, the frontend fetches vault data via `fetchTopVaults()` and matches by slug to populate metrics like TVL, returns, and fees.

## Configuration reference

Each YAML strategy file has the following fields:

| Field               | Required | Description                                                |
| ------------------- | -------- | ---------------------------------------------------------- |
| `id`                | yes      | Unique strategy identifier (used in URL)                   |
| `name`              | yes      | Display name                                               |
| `short_description` | yes      | One-line summary shown in listing tiles                    |
| `long_description`  | no       | Markdown description shown on the overview page            |
| `icon_url`          | no       | Path to strategy icon image                                |
| `vault_slug`        | yes      | Slug matching a vault in the vault browsing API            |
| `chain_id`          | yes      | Blockchain chain ID (as a quoted string)                   |
| `tags`              | no       | Array of tags; include `live` for public visibility        |
| `sort_priority`     | no       | Higher values appear first in the listing (default: `0`)   |
| `frontpage`         | no       | Set to `'true'` to show on the homepage (default: `false`) |

All values should be quoted strings in the YAML file. The `FAILSAFE_SCHEMA` parser treats everything as strings, and Zod handles type coercion for numeric and boolean fields.

## Example: ICHI v3 strategy on the local test server

The repository includes an example YAML strategy that works with the integration test mock data.

### 1. YAML config file

`src/lib/strategies/yaml/configs/trading-strategy-ichiv3-ls-2.yaml`:

```yaml
id: trading-strategy-ichiv3-ls-2
name: ICHI v3 Liquidity Strategy
short_description: Automated liquidity provision using ICHI v3 vaults
vault_slug: trading-strategy-ichiv3-ls-2
chain_id: '9999'
tags:
  - live
sort_priority: '5'
frontpage: 'true'
```

### 2. What each field does in this example

- **`id: trading-strategy-ichiv3-ls-2`** — the URL will be `/strategies/trading-strategy-ichiv3-ls-2`
- **`vault_slug: trading-strategy-ichiv3-ls-2`** — matches the vault slug in the mock vault data served by the test server
- **`tags: [live]`** — visible to non-admin users
- **`sort_priority: '5'`** — appears after higher-priority strategies in the listing
- **`frontpage: 'true'`** — appears in the featured strategies section on the homepage

### 3. Running the test server

The local test server uses mock API responses defined in `tests/mocks/`. The vault data mock at `tests/mocks/top-vaults/list.mock.ts` includes a vault with slug `trading-strategy-ichiv3-ls-2` that provides the metrics displayed on the strategy page.

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

1. Create a new YAML file in `src/lib/strategies/yaml/configs/`, e.g., `my-strategy-hyperliquid.yaml`
2. Set `vault_slug` to match an existing vault in the vault browsing API
3. Add `tags: [live]` when ready for public visibility
4. Set `frontpage: 'true'` if it should appear on the homepage
5. Rebuild — the strategy is picked up automatically at build time via `import.meta.glob`
