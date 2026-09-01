# Chart pages

This document describes chart pages and chart navigation in the Trading Strategy frontend. It focuses on vault chart pages under `src/routes/vaults/`, but also notes the shared charting libraries used elsewhere.

## Vault chart pages

The vault chart pages linked from the top `Charts` menu are:

- `/vaults/compare` - user-selected vault equity curves with optional US Treasury, ETH, and BTC benchmarks.
- `/vaults/cumulative-tvl-apy` - cumulative vault TVL by annualised return, with benchmark lines.
- `/vaults/yield-risk` - vault annualised return by TVL, grouped by risk level.
- `/vaults/yield-protocol` - vault annualised return by TVL, grouped by protocol.
- `/vaults/yield-chain` - vault annualised return by TVL, grouped by chain.
- `/vaults/current-peak-tvl` - current TVL by peak TVL.
- `/vaults/core3-risk` - stablecoin vault returns and TVL by CORE3 Probability of Loss.
- `/vaults/historical-tvl-chain` - historical vault TVL grouped by chain.
- `/vaults/historical-tvl-stablecoin` - historical vault TVL grouped by stablecoin.
- `/vaults/historical-tvl-protocol` - historical vault TVL grouped by vault protocol.
- `/vaults/stablecoin-chain-heatmap` - current stablecoin vault TVL by stablecoin and chain.

Related vault list pages also include charts:

- `/vaults/stablecoins`, `/chains`, `/protocols`, and `/curators` use `MarketSharePieChart.svelte`.
- Group detail pages use `VaultGroupMiniChart.svelte`.
- Vault detail pages use lightweight-charts components for share price, utilisation, and benchmark series.

The home page vault ecosystem chart reuses the cumulative TVL / APY ECharts renderer through `src/routes/_components/VaultEcosystemChartECharts.svelte`.

### Vault comparison

`/vaults/compare` uses the shared `Search.svelte` result presentation as an
in-page vault selector. Suggestions include the same logos, protocol and chain
context, APY, TVL, and sparkline shown by site-wide search, but exclude vaults
below $1,000 current TVL. An accepted Add action clears the query and closes
the suggestion panel.

The page defaults to Savings USDS with the T-bill, ETH, and BTC benchmarks
enabled. It supports up to eight vaults, stores the ordered selection and
benchmarks in repeated URL parameters, and preserves an intentionally empty
selection with `comparison=empty`. Selected vaults also appear in the shared
top-vaults table below the chart.

The T-bill line uses FRED's DGS3MO 3-month constant-maturity Treasury market
yield, quoted on an investment basis, as a cumulative-return approximation.

The chart is labelled **Vault returns index**. The oldest selected vault starts
at 100; each younger vault starts at the highest older curve that overlaps its
first observation. A non-overlapping history starts at 100 and is marked in the
legend. The 1M, 3M, 6M, 1Y, and Max controls drive both the visible range and
the CAGR/Since values shown on selected-vault cards. T-bill, ETH, and BTC use
fixed colours, while vaults receive stable, distinct colours for the current
selection.

## Data flow

Most vault chart pages read from the top-vaults dataset, not from page-specific backend APIs.

The common data sources are:

- `getCachedTopVaults(fetch)` from `src/lib/top-vaults/cache` for current vault metadata, TVL, returns, stablecoin flags, CORE3 data, chains, protocols, and groupings.
- `src/lib/echarts/*` helpers for server-side chart payload preparation.
- Route-local `chart-data/+server.ts` endpoints for heavier ECharts pages that need cached JSON payloads.
- Client-side `fetch()` from `+page.svelte` for pages that opt out of SSR or need lazy chart data loading.
- `+page.server.ts` for pages that can prepare their data during server rendering.
- Vault detail metrics endpoints such as `/vaults/[vault]/metrics` for time-series data.
- `/vaults/compare/chart-data` for a bounded, cached payload containing only the selected vaults. The endpoint performs
  equity alignment, four-hour/daily resampling, benchmark fetching, and benchmark indexing on the server; the browser
  receives chart-ready points rather than raw vault share-price histories.

Before this dataset reaches chart payload builders, raw USD and Kinexys accounting denominations are normalised to the single `USD (offchain)` / `usd-offchain` group. Charts must use this normalised metadata and must not add provider-specific off-chain USD series.

Current cached chart-data endpoints include:

- `core3-risk/chart-data/+server.ts`
- `historical-tvl-chain/chart-data/+server.ts`
- `historical-tvl-stablecoin/chart-data/+server.ts`
- `historical-tvl-protocol/chart-data/+server.ts`
- `stablecoin-chain-heatmap/chart-data/+server.ts`

These endpoints cache their derived JSON in memory and may serve Brotli-compressed responses.

The five migrated Plotly/cumulative pages have purpose-built route-local endpoints:

- `yield-risk/chart-data/+server.ts`
- `yield-chain/chart-data/+server.ts`
- `yield-protocol/chart-data/+server.ts`
- `current-peak-tvl/chart-data/+server.ts`
- `cumulative-tvl-apy/chart-data/+server.ts`

The cached endpoints usually:

1. Read the top-vaults dataset.
2. Filter or group vaults server-side.
3. Build a typed chart payload.
4. Cache the JSON payload in process memory.
5. Serve Brotli-compressed JSON when the client accepts `br`.

The four Plotly scatter pages and the cumulative TVL/APY ECharts page fetch small route-local payloads. Their server builders apply eligibility, grouping, ordering, and cumulative calculations from the shared top-vaults cache; the browser only renders the returned points and manages presentation controls. They do not fetch the complete top-vaults export.

## Charting libraries

The frontend uses three charting approaches:

- **ECharts** for newer aggregated vault chart pages, historical TVL charts, heatmaps, CORE3 charts, market share pies, mini charts, and the home page vault ecosystem chart. The runtime is loaded through `src/lib/echarts/runtime.ts`.
- **Plotly.js** for older interactive vault scatter pages: yield/risk, yield/protocol, yield/chain, current/peak TVL, and the legacy home page reference component. Plotly is loaded dynamically from CDN through `src/lib/scatter-plot/helpers.ts`.
- **TradingView lightweight-charts** for time-series price, benchmark, utilisation, candle, and thumbnail charts. Shared wrappers live in `src/lib/charts/`, and vault-specific time-series charts live under `src/lib/top-vaults/`.

Prefer ECharts for new aggregated chart pages unless an existing page pattern strongly points elsewhere. Prefer lightweight-charts for financial time-series views where crosshair behaviour and time axes are central. Avoid adding new Plotly pages unless maintaining an existing Plotly scatter family.

## Chart types

Existing chart types include:

- Scatter plots: Plotly vault return / TVL charts and current / peak TVL charts.
- Hexbin-style binned scatter: CORE3 stablecoin returns by Probability of Loss.
- Bar charts: CORE3 stablecoin TVL by Probability of Loss band.
- Line and area charts: cumulative TVL / APY and historical grouped TVL.
- Stacked area charts: historical TVL by chain, stablecoin, and protocol.
- Heatmaps: stablecoin / chain TVL matrix.
- Pie charts: current market share by stablecoin, chain, protocol, or curator.
- Mini line charts: group-level vault TVL history.
- Candlestick, baseline, area, histogram, and benchmark overlays: lightweight-charts time-series components.

### Vault group listing headers

The stablecoin, chain, protocol, curator, and tokenised-fund listing pages use
`src/routes/vaults/VaultGroupIndexHeader.svelte` for their introduction and
summary pie chart. It uses a two-column layout only above the large breakpoint
and stacks the chart below the introduction at `width <= 1024px`. This prevents
the chart's 25rem minimum width from compressing the introduction on portrait
iPads.

## Chart page navigation

There are two separate vault chart navigation surfaces.

The top vault listings navigation lives in:

- `src/lib/top-vaults/VaultListingsSelector.svelte`

Its `chartLinks` array controls the `Charts` dropdown shown near the `Vaults by:` navigation. Add new user-facing chart pages here when they should be discoverable from the global vault listings nav.

The in-page chart selector lives in:

- `src/lib/scatter-plot/ScatterPlotSelector.svelte`

Its `charts` array controls the `See charts:` link row displayed within chart pages. Add new chart pages here when users should be able to move laterally between chart pages.

When adding or removing a chart page, update both arrays unless there is a deliberate reason for the page to appear in only one navigation surface. Also update integration tests that assert menu or selector counts:

- `tests/integration/vaults/charts-dropdown.test.ts`
- chart-page tests that assert `.scatter-plot-selector a` counts

The dropdown and in-page selector can intentionally have different counts. For example, a page can be present in the in-page selector before it is added to the top dropdown, but this should be explicit in the change.

## Testing

Use Playwright integration tests for chart page navigation and route rendering. The integration test harness uses a test-mode build and Vite preview; for manual development and visual checks, use `pnpm run dev` instead.

If the dev server runs from a git worktree, follow [worktree setup](../.claude/docs/worktree.md)
first so private env vars and the historical vault parquet cache are available to chart endpoints.

Useful checks:

- Run unit tests for chart payload builders, e.g. `pnpm exec vitest run src/lib/echarts/core3-risk.test.ts`.
- Run focused Playwright specs after navigation changes, e.g. `pnpm exec playwright test --config tests/integration tests/integration/vaults/charts-dropdown.test.ts`.
- Run `pnpm run build:test` before focused integration specs if `.svelte-kit-test/output/server` is missing.
- Use Playwright browser checks to verify canvas count, tooltip content, and navigation when adding a new ECharts page.
