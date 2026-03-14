# ECharts

This document describes how ECharts is currently used in the frontend, why it is loaded the way it is, and the main lessons learnt while integrating it.

## Current usage

ECharts is currently used in three places:

- The front page vault ecosystem widget
- The standalone cumulative TVL / APY page
- A diagnostics page used for prototyping and visual tuning

The shared charting core now lives in:

- `src/lib/echarts/runtime.ts`
- `src/lib/echarts/cumulative-tvl-apy.ts`
- `src/lib/echarts/CumulativeTvlApyChart.svelte`

The front page adapter lives in:

- `src/routes/_components/VaultEcosystem.svelte`
- `src/routes/_components/VaultEcosystemChartECharts.svelte`

The standalone page adapter lives in:

- `src/routes/trading-view/vaults/cumulative-tvl-apy/CumulativeTvlApyChart.svelte`

The diagnostics implementation lives here:

- `src/routes/diagnostics/echarts-vault-ecosystem/+page.server.ts`
- `src/routes/diagnostics/echarts-vault-ecosystem/+page.svelte`

The original Plotly front page widget still exists in the repository as a reference component:

- `src/routes/_components/VaultEcosystemChart.svelte`

However, the front page loader now imports the ECharts variant, and the standalone cumulative TVL / APY page now also uses the same shared ECharts renderer instead of its old Plotly-specific implementation.

## Why we load it dynamically

ECharts is not bundled into the initial front page JavaScript.

Instead we:

1. Wait until the front page widget is near the viewport using `svelte-inview`
2. Dynamically import the Svelte component that contains the ECharts implementation
3. Fetch `/top-vaults/chart-data` on the client
4. Inject the ECharts runtime from jsDelivr only when the chart is actually needed

This keeps the initial front page payload smaller and avoids paying the charting cost for users who never scroll to that section.

The runtime loader now lives in `src/lib/echarts/runtime.ts` and uses a cached `echartsPromise` plus `window.echarts` detection so the script is only loaded once per page.

## Front page flow

The front page widget flow is:

1. The page renders a skeleton placeholder
2. `VaultEcosystem.svelte` becomes visible
3. The component imports `VaultEcosystemChartECharts.svelte`
4. The component fetches `/top-vaults/chart-data`
5. `VaultEcosystemChartECharts.svelte` adapts the payload into the shared chart point format
6. `src/lib/echarts/CumulativeTvlApyChart.svelte` loads the ECharts CDN runtime
7. The shared renderer initialises ECharts and renders the compact homepage variant

The front page widget also receives `savingsRate` and `treasuryRate` from the page data so benchmark lines can be drawn without an extra client-side reference-rate request.

## Standalone page flow

The standalone cumulative TVL / APY page now reuses the same ECharts rendering core, but keeps its existing page-level controls and URL state.

Its flow is:

1. The page loads benchmark rates server-side
2. The page adapter reads and updates URL search params for filters and axis mode
3. The adapter filters the full vault dataset and maps it to shared cumulative TVL points
4. `ScatterPlotShell.svelte` renders the existing controls and hosts the chart content
5. `src/lib/echarts/CumulativeTvlApyChart.svelte` renders a larger standalone preset with larger fonts and layout spacing

This keeps the filter logic, selector UI, and URL persistence in the page layer while moving the actual chart runtime, axis maths, benchmark series, tooltip rendering, and click navigation into the shared renderer.

## Diagnostics page flow

The diagnostics page uses the same general chart logic, but is structured to make experimentation easier.

Its server load function fetches:

- `fetchLatestFredValue('SNDR')`
- `fetchLatestTreasuryRate()`

The page then loads the ECharts runtime and `/top-vaults/chart-data` client-side and renders a larger, easier-to-tune version of the same chart.

This route is useful for:

- trying visual changes without touching the front page wrapper
- tuning tooltip behaviour
- testing axis ranges and label layout
- checking benchmark behaviour

## Data and chart rules

Both production adapters follow the same core filtering and transformation rules:

- blacklist entries are excluded using `isBlacklisted()`
- minimum TVL is `50_000`
- the one-month APY comes from `one_month_cagr_net ?? one_month_cagr`
- vaults with APY above `10` are excluded
- the x-axis uses a logarithmic annualised returns scale
- the x-axis is capped at `750%`
- the y-axis is cumulative TVL on a logarithmic scale

For the shared renderer, the y-axis headroom is added in log-space when log axes are enabled. This matters because a simple numeric multiplier does not create a visually consistent gap on a logarithmic axis.

The shared helper module also centralises:

- cumulative TVL point construction
- benchmark line sampling and TVL split calculations
- axis bounds calculation for both log and linear modes
- tooltip formatting helpers and HTML escaping

## Tooltip behaviour

The shared ECharts renderer uses HTML tooltips with data assembled in TypeScript.

Current tooltip behaviour includes:

- vault title
- chain and protocol metadata row
- chain logo next to the chain label
- protocol logo next to the protocol label
- annualised returns
- vault TVL
- cumulative TVL breakdown above and below the selected point
- click hint for vault detail navigation

Benchmark tooltips show:

- benchmark label and current rate
- short benchmark description
- TVL earning better than the benchmark
- TVL earning less than the benchmark
- click hint for glossary navigation

Tooltip strings are HTML-escaped before insertion.

## Interaction design

The shared chart is intentionally lightweight and does not expose the default ECharts toolbox or control chrome.

Current interaction choices:

- vault points are clickable and navigate to vault detail pages
- benchmark lines are clickable and navigate to glossary entries
- benchmark lines use a large invisible symbol size for hover and click hit-testing
- vault points scale up on hover
- the widget uses a custom dark tooltip and site font stack rather than ECharts defaults

## Styling choices

The shared renderer supports two visual presets today:

- a compact glass-framed homepage variant
- a larger plain standalone-page variant

The homepage variant is designed to fit the front page rather than look like a generic chart embed.

Notable choices:

- custom shell background with gradients and glow
- framed grid area instead of a plain chart rectangle
- shared site body font stack from `chartFontFamily`
- benchmark orange for reference lines
- theme red hover state
- translucent dots and gradient area fill
- taller non-mobile chart area than mobile

The homepage widget content area is currently `500px` high on non-mobile viewports and `400px` high on smaller viewports. The skeleton and error states use the same height so layout does not jump while the chart loads.

The standalone page uses a larger preset so axis labels, tooltip text, and plot spacing remain legible alongside the existing controls.

## Testing

The ECharts migration is covered by integration tests in:

- `tests/integration/index.test.ts`
- `tests/integration/trading-view/vaults/cumulative-tvl-apy.test.ts`

The home page test checks that the page:

- scrolls the widget into view
- loads the lazily rendered chart
- shows a real chart canvas
- does not fall back to the `Data failed to load` state
- does not emit browser `pageerror` exceptions

The standalone page test checks that the page:

- renders the ECharts canvas on the cumulative TVL / APY route
- keeps the existing chart controls and navigation shell intact
- does not emit browser `pageerror` exceptions

This test currently uses the real CDN runtime instead of stubbing ECharts.

## Lessons learnt

### 1. Logarithmic padding needs log-space maths

If the y-axis is logarithmic, adding headroom with a simple multiplier does not create a consistent visual gap. The front page widget now computes top padding in log-space so the highest point sits roughly 10% below the top edge in visual terms.

### 2. Thin benchmark lines need explicit hover geometry

Very thin vertical lines are difficult to hover and click reliably. The benchmark series became much more usable after sampling many points along the line and giving them a large invisible symbol size.

### 3. Canvas text needs an explicit font stack

Relying on inherited fonts was not enough. ECharts renders labels on canvas, so the chart had to use the same explicit font family string as the rest of the site to avoid inconsistent typography.

### 4. Keep tooltip images defensive

Logo URLs are useful in tooltips, but remote or generated image URLs can fail. Tooltip images should fail closed and hide themselves rather than leaving broken image icons in the overlay.

### 5. Split adapters from renderer

The cleanest structure was to keep page-specific data shaping and control logic in thin route adapters, and move runtime loading, axis maths, benchmark series creation, and tooltip rendering into a shared renderer. That reduced duplication without forcing the homepage and standalone page into the same outer UI shell.

### 6. Lazy loading is the right default for homepage use

The front page widget is not essential above the fold. Deferring the component import, the data fetch, and the ECharts runtime until the section is near the viewport keeps the page lighter and makes ECharts practical on the homepage.

### 7. Keep diagnostics and production separate

The diagnostics page made it much easier to experiment with layout, axis logic, hover states and tooltip behaviour without repeatedly destabilising the front page section.

### 8. Shared renderers still need route-specific tests

Even with a shared renderer, the homepage and standalone page exercise different loading paths. The homepage relies on lazy loading and client fetching, while the standalone page depends on URL-driven controls and a different layout preset. Both routes need their own browser coverage.

### 9. Real-CDN integration tests are useful but have trade-offs

Using the real CDN in integration tests gives stronger end-to-end confidence for the actual runtime path. The downside is that it introduces an external dependency into the test run. If CDN stability becomes a recurring issue, consider splitting the coverage into:

- one deterministic test with a stubbed runtime
- one smaller smoke test that exercises the live CDN path

## When editing this setup

If you change the front page widget, check these areas together:

- `VaultEcosystem.svelte` lazy loading and placeholder states
- `VaultEcosystemChartECharts.svelte` homepage-specific data mapping
- `src/lib/echarts/CumulativeTvlApyChart.svelte` shared rendering behaviour
- `src/lib/echarts/cumulative-tvl-apy.ts` shared point and axis maths
- benchmark hover and click hit-testing
- tooltip content and escaping
- integration coverage in `tests/integration/index.test.ts`

If you change the standalone page, check these areas together:

- `src/routes/trading-view/vaults/cumulative-tvl-apy/CumulativeTvlApyChart.svelte` control logic and URL state
- `src/lib/scatter-plot/ScatterPlotShell.svelte` chart hosting behaviour
- `tests/integration/trading-view/vaults/cumulative-tvl-apy.test.ts`

If the change is primarily visual or experimental, prefer trying it on the diagnostics page first and then porting the result into the front page widget once the behaviour is stable.
