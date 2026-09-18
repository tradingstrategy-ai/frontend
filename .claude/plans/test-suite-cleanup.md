# Test suite clean-up — remove low-value, duplicated and over-split tests

## Status (2026-09-18)

Planned; not started. Reviewed by Grok (grok-4.6) on 2026-09-18 in read-only mode; its eleven findings (three high) are folded in below — the main corrections were that `.scatter-plot-selector` is a different component from the Charts dropdown, that `tests/e2e/trading-view/chain-details.ts` should be renamed rather than deleted, that the vault-detail block in `vaults/index.test.ts` was mis-described and does not overlap `VaultTransactionStatus.test.ts`, and that the target counts were optimistic. Based on a full audit of `src/**/*.test.ts`, `tests/integration` and `tests/e2e` on master at `192e977a`, with runtime measured locally (unit: Vitest JSON reporter; integration: Playwright JSON reporter, 4 workers) and cross-checked against the CI run of 2026-09-18 08:55 UTC (`test` job: build 1 m 13 s, unit + integration 4 m 13 s; `test-e2e` job: 19 s of tests).

## Goal

Reduce the test load without losing any behaviour coverage. The suite has grown by "one PR, one test file, one `test()` per assertion" and by copy-pasting sibling-page tests. The cost is not mainly CPU — it is Playwright page loads (each one 0.7–3 s), flake surface, and 15 k lines of test code that reviewers and agents must read.

Success criteria:

- Unit suite (`pnpm run test:unit --run`) no longer performs network I/O and completes in under 5 s of aggregate file time (10.5 s today).
- Integration suite runs ≤ 300 tests (385 today) and its aggregate test time falls by ≥ 20 % (329 s today); the CI `test` job's test step drops from ~4 m 13 s towards ~3 m 15 s. The time saving is larger than the count saving suggests because the removed tests are the ones whose only cost is a page load.
- No assertion is dropped except (a) exact duplicates of an assertion made elsewhere on the same page/component, or (b) assertions against code that is not in this repository. Every "consolidate" step below lists what must survive.
- `pnpm run check`, `pnpm run lint`, `pnpm run test:unit --run` and `pnpm run test:integration` stay green; the known local flake (`vaults/index.test.ts` "falls back to vault sorting…", see memory note) is not made worse.
- `docs/tests.md` still describes the suite accurately after the changes.

## Measured baseline

| Suite                      | Files                 | Tests                                 | Aggregate time                | Notes                                                                                                                                |
| -------------------------- | --------------------- | ------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Unit (Vitest)              | 83 (+1 script test)   | 659                                   | 10.5 s                        | `reference-rates.test.ts` alone: 6.46 s (62 %) locally; its FRED tests are `describe.skipIf(CI)`, so CI pays only the Treasury call  |
| Integration (Playwright)   | 41                    | 385                                   | 329 s (83 s wall @ 4 workers) | 199 `page.goto()` call sites in source; at runtime `vaults/index.test.ts` alone loads `/vaults` 57× via `beforeEach` plus 10 in-body |
| E2E (Playwright, prod API) | 8 (+1 unmatched file) | 17 in `.test.ts` files (14 run in CI) | ~19 s                         | 3 tests permanently `test.skip` in CI; `chain-details.ts` (3 tests) never collected                                                  |

Integration time by file (top 10, aggregate ms / tests): `vaults/index` 41 637 / 57 · `vaults/datasets` 33 288 / 30 · `search` 26 989 / 17 · `vaults/group-market-share-pages` 24 994 / 26 · `vaults/charts-dropdown` 18 527 / 12 · `vaults/social-meta-tags` 17 410 / 31 · `vaults/equity-compare` 17 031 / 6 · `layout-shift` 10 996 / 3 · `strategies/yaml-strategy` 9 697 / 10 · `head-meta` 9 619 / 40.

The audit's raw timing files are not committed; re-generate with
`pnpm run test:unit --run --reporter=json --outputFile=<f>` and
`PLAYWRIGHT_JSON_OUTPUT_NAME=<f> pnpm exec playwright test --config tests/integration --reporter=json`
(note: `pnpm run test:integration -- --reporter=json` passes the `--` literally and finds no tests).

## Patterns being removed

1. **Page reload per assertion.** `test.beforeEach(() => page.goto(url))` followed by 5–20 `test()`s that each check one element of the same static page. Fold into one `test()` per _state_ of the page (initial, after an interaction, after a redirect), keeping every `expect`.
2. **Sibling-page copy-paste.** The same `test()` body repeated across the chain / protocol / stablecoin / curator / fund variants of a page that share one component. Test the shared component once, smoke each page once.
3. **Integration re-proving a unit test.** Dropdown open/close/aria, transaction-status labels, etc. are asserted in a component unit test and again in a browser test that reloads a page for each. Keep the browser test only for what needs a real page: layout, z-index, navigation, hydration.
4. **Tests of code that is not the code.** A test file that re-implements the function it claims to test.
5. **One-assertion tests over lookup tables.** `getFeeModeLabel('feeless')` → `'Feeless'` as six separate `test()`s. Use `test.each` or a single test. (No runtime saving; reduces noise and keeps the file readable.)

## Workstream 1 — deletions (ship first, trivial)

1. **Delete `src/lib/reference-rates.test.ts`.** It does not import `src/lib/reference-rates.ts`; it defines its own `fetchFredCsvLatest` and `fetchTreasuryNoteRate` and calls live `fred.stlouisfed.org` and `api.fiscaldata.treasury.gov` (30 s fetch abort, 45 s test timeouts, `retry: 2` on the first FRED test, 2 s sleeps between requests). The FRED block is skipped in CI; the Treasury test still runs there. It tests nothing in the repo, is the only network I/O in the unit suite, and is 62 % of unit runtime. If a real test of `reference-rates.ts` is wanted later, write one that mocks `fetch` and asserts the SWR/file-cache fallback behaviour — that is the logic the module actually owns.
2. **Rename `tests/e2e/trading-view/chain-details.ts` → `chain-details.test.ts`.** Missing `.test.` in the filename, so Playwright's default `testMatch` has never picked it up (added in commit `4d77a925`). Its three assertions (`data-testid="chain-summary"` block contents, exchanges table ≥ 10 rows, pairs table ≥ 10 rows) are asserted nowhere else, so this is a rename-and-make-pass, not a delete. Run it against production before merging; if the page has changed so much that the test needs rewriting, do that in the same PR. Delete only if the chain details page itself no longer exists.
3. **Permanent CI skips** — `tests/e2e/trading-view/pair-index.test.ts:14,27,41`, `tests/integration/diagnostics.test.ts:14` and `tests/integration/trading-view/pair-details.test.ts:28` all carry `test.skip(!!process.env.CI, 'Skipping on CI runs for now')`. For each: either remove the skip and make it pass, or delete the test. Do not leave permanently skipped tests.
4. **Delete `src/lib/top-vaults/helper.test.ts`.** It is a second `getFormattedLockup` suite (7 tests) importing from `./helpers`, duplicating `helpers.test.ts:657–690`. One case is unique — `lockup = 59` → `'Instant'` (`helper.test.ts:16–21`); move it into the `helpers.test.ts` table before deleting the file.

## Workstream 2 — integration consolidation, high value

Target counts are for the file's `test()` calls. Every assertion listed under "must survive" stays; everything else in the file is either an exact duplicate or is subsumed.

### 2.1 `tests/integration/vaults/datasets.test.ts` — 30 → ~12

- Page tests (20 → 4): one test per page state.
  - _initial page_: title; docs link href; column headers; the seven dataset names; Free/Pro badges; filenames; JSON/Parquet labels; API-key form + Enter button visible; disabled download `span`s; curl placeholder key; no "Thank you for your purchase".
  - _checkout redirect_: `?checkout_id=…` → `cache-control: no-store`, thank-you + check-email text, key form visible.
  - _invalid key_: 401 → "The API key is not valid".
  - _valid key_: one `submitApiKey(VALID)` then assert: `a.action-link` downloads visible, key form hidden, key text shown, curl shows real key and no placeholder, gated `href` contains `api-key=`.
- Endpoint tests (10 → ~8): keep the status-code cases and the per-dataset header loop; fold "proxies content-length" and "body is non-empty" into the `vault-metadata` valid-key test.
- Drop `waitForLoadState('networkidle')` from `beforeEach` only if the assertions above pass without it; `submitApiKey` (`datasets.test.ts:7–14`) already waits on the `/api/files` response, so the valid/invalid-key tests do not need it.

### 2.2 `tests/integration/vaults/group-market-share-pages.test.ts` — 26 → ~9

All five pages render the shared `.vault-group-index-header` (intro column + chart column) and `VaultListingsSelector`. Layout at three viewports is a property of that component, not of each page.

- Keep one **per page** test: heading, chart canvas visible, table visible, chart heading — and assert the `.loading-overlay` is visible before `load` inside the same test. Hard constraint: the merged test must `goto(url, { waitUntil: 'domcontentloaded' })`, otherwise the overlay has already gone by the time the locator is checked. Keep the per-page `widgetTestId` — five different pie widgets.
- Keep the three viewport-layout tests (desktop right column, mobile stacked, 820 px iPad stacked) for **one** page only (`/vaults/protocols`).
- Keep "protocols index links to CORE3 and Xerberus…".

### 2.3 `tests/integration/vaults/charts-dropdown.test.ts` — 12 → 5

`src/lib/components/DropdownMenu.test.ts` asserts the generic component: trigger label, panel hidden by default, opens with items, item count (3-item fixture), closes on second click, `aria-expanded`, `isActive` styling on trigger and item, `resolveHref`. It explicitly defers click-outside to Playwright (`DropdownMenu.test.ts:86–87`) and knows nothing about the vault navigation wiring — order, the 11 real chart labels, z-index over the table, navigation. The unit test therefore replaces only "Charts trigger is visible", "clicking trigger again closes" and the generic half of the active-state tests. Keep:

- _desktop, stays on page_: navigation order; open → 11 chart labels; open menu is above the table (z-index); clicking outside closes.
- _desktop, navigates_: clicking a chart link navigates to the chart page. Separate test — it leaves `/vaults`, so it cannot share the previous test's page state.
- _active state on chart pages_: table-driven over the 11 chart URLs — trigger has `.active` and `[role="menu"] a.active` has the expected label. This becomes the **single** owner of the active-state behaviour (see 2.5). Use `test.step` per URL so a failure names the page; if diagnosis matters more than count, generate one `test()` per URL from the table instead.
- _mobile_: trigger visible, opens, navigates, outside click closes — one test.

### 2.4 `tests/integration/vaults/social-meta-tags.test.ts` — 31 → ~16

- Listing pages (`/vaults`, `/vaults/high-tvl`, `/vaults/new-vaults`, `/vaults/stablecoins`): one test each that asserts og:title/description/url/site_name/type, twitter card/site/title/description, and `expectSocialCardImage(...)`. Keep the 1200×630 decode + `imageHasCardContent` check on `/vaults` only among these four (same generated card) — but **also keep** the `imageHasCardContent` check on `/vaults/chains/megaeth` (`:302–307`), which tests a dark chain logo, not the default card.
- Stablecoin detail (6 → 2): meta + image + JSON-LD + description box in one; "uses the Trading Strategy image when no logo" stays separate (different URL).
- Social card image priority (10 → 9): these hit distinct `/social-card/...` URLs and test the fallback chain; keep, merging only "rejects external fallback redirects" and "rejects malformed vault IDs" into one negative-cases test.
- Zero-vault stablecoin (3 → 1).
- `tests/integration/head-meta.test.ts` covers `/vaults` and `/vaults/return-leader-alpha` only, and asserts only: one branded `<title>`, one description of 70–155 chars, and that exactly one `og:image` tag exists. Do not re-assert _those three_ here. Everything else in this file — the other listing URLs, twitter tags, `og:url`/`og:site_name`/`og:type`, the image URL pattern, the decode and the card-content pixel check — is not covered by `head-meta` and must survive.

### 2.5 Chart-page files — remove per-page copies of shared navigation tests

The following `test()` bodies are copy-pasted across `cumulative-tvl-apy`, `yield-protocol`, `yield-risk`, `yield-chain`, `historical-tvl-chain`, `historical-tvl-protocol`, `historical-tvl-stablecoin`, `stablecoin-chain-heatmap`:

- "has vault listings navigation with active Charts dropdown" — 7 named copies (`yield-protocol`, `yield-risk`, `cumulative-tvl-apy`, `historical-tvl-chain`, `historical-tvl-protocol`, `historical-tvl-stablecoin`, `stablecoin-chain-heatmap`), plus the trigger-`.active`-only inline variant in `yield-chain.test.ts:12–16` and `current-peak-tvl.test.ts:12–16` → delete the 7 named tests and the two inline blocks; replace with the table-driven test in `charts-dropdown.test.ts` described in 2.3. Same coverage (in fact stronger for the two inline pages, which never opened the menu), one owner.
- "displays scatter plot selector with all/both chart links" (`.scatter-plot-selector`, `toHaveCount(11)`; 3 named copies plus inline in `yield-chain` and `current-peak-tvl`) — **this is not the Charts dropdown.** `.scatter-plot-selector` is `src/lib/scatter-plot/ScatterPlotSelector.svelte`, the in-page "See charts:" link row; the dropdown is `[role="menu"]` from `VaultListingsSelector`. Do not delete these assertions as duplicates. Fold the two lines (visible + 11 links) into each file's render test so they stop costing a page load, or make them a second `test.step` in the 2.3 table-driven test.
- "displays page title and hero banner" (2 copies, `h1` contains "scatter plot") → fold into the file's render test.
- "page has no JavaScript errors" (`cumulative-tvl-apy:78`, `historical-tvl-chain:89`) → attach `page.on('pageerror')` in the file's first render test instead of a separate page load. The listener must be attached **before** `goto` — the existing render tests call `goto` first, so reorder. (`stablecoins.test.ts:112` is a different test on the pie page; see 2.6.)

Per-file results: `cumulative-tvl-apy` 6 → 2 (test "renders APY vs cumulative TVL line chart" is a strict subset of "renders the ECharts line chart"; keep the immutable-asset test); `yield-protocol` 5 → 2; `yield-risk` 5 → 3 (keep the Plotly legend-interaction test); `historical-tvl-chain` 6 → 3; `historical-tvl-protocol` / `-stablecoin` 3 → 2 each; `stablecoin-chain-heatmap` 4 → 3; `yield-chain` and `current-peak-tvl` stay one test each, minus their inline nav block.

### 2.6 Small static pages and other pattern-1 files

- `tests/integration/pricing.test.ts` 9 → 2: one content test (title, meta description, h1, tier cards, $199 heading, Start Pro href, comparison heading, DEX row link), one navigation test ("Download free sample" → `/vaults/datasets`).
- `tests/integration/index.test.ts` (home) 6 → 3: content (title, featured strategies, top vaults, blog); hero preload; lazy ecosystem widget. The widget test (`:34–47`) does its own `goto` with a `pageerror` listener and scrolls — leave it as is; only the four content tests merge.
- `tests/integration/strategies/yaml-strategy.test.ts` 10 → ~5: listing tile (appears + metrics) in one; overview page (renders + freshness debug + metrics + left nav) in one; the four sub-page tests (performance, description, vault, fees) become one `for` loop or stay as four — they hit different URLs, so no page-load saving either way.
- `tests/integration/vaults/stablecoins.test.ts` 9 → 8: fold "has no JavaScript errors after the chart loads" into the first test (attach the listener before `goto`).
- `tests/integration/trading-view/token-details.test.ts` (`:13–39`): `beforeEach` `goto` plus several one-assertion tests on the same liquid-token page — same pattern as pricing. Optional; the assertions are heavier than title checks, so the saving is 2–3 page loads.

### 2.7 `tests/integration/vaults/index.test.ts` — detail-page block (lines 1009–1117)

Ten tests sit after the listing tests and mostly load a vault _detail_ page, each asserting one alert:

| Lines     | Test                                                                                                                   | Action                                                                                                    |
| --------- | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 1009–1018 | Morpho flagged vault: one `.alert-list.error` with `bad_debt_unrealized`, no `.notes`                                  | keep as is                                                                                                |
| 1020–1025 | mobile viewport hides `.cta-actions`                                                                                   | keep as is (needs a viewport, cannot be `request.get`)                                                    |
| 1027–1035 | deposit-disabled tokenised fund info alert                                                                             | **delete** — `funds.test.ts:34–46` asserts the same alert more fully                                      |
| 1037–1043 | `.transaction-status` shows "Deposits Capped", not "Deposits Open"                                                     | table row — **unique**; `VaultTransactionStatus.test.ts` covers only healthy and Private/Open, not Capped |
| 1045–1051 | withdrawal-disabled warning                                                                                            | table row                                                                                                 |
| 1053–1059 | deposits-and-withdrawals-disabled warning                                                                              | table row                                                                                                 |
| 1061–1067 | capped-and-withdrawal-disabled warning                                                                                 | table row                                                                                                 |
| 1069–1097 | private vault: listing cell + hover tooltip, then detail page alert + whitelist rows, then tokenised-fund listing cell | keep as is — mixed listing/detail with a hover; do not split or move                                      |
| 1099–1108 | listing cell shows "Capped" (`/vaults/all?q=…`)                                                                        | keep as is — listing test                                                                                 |
| 1110–1115 | tokenised-fund disclaimer instead of permissioned warning                                                              | table row                                                                                                 |

The five "table row" tests become one `test()` looping `[slug, selector, text]` with `page.goto` (not `request.get` — keep the hydrated DOM so `.transaction-status` and `.notification-stack` are what the user sees) and a `test.step` per slug for diagnosis. 10 → 6.

Move only the detail-page tests (1009–1067 minus the deleted one, and 1110–1115) into `tests/integration/vaults/detail.test.ts`, so the file name matches the route. The two listing tests stay in `index.test.ts`.

## Workstream 3 — unit tidy-ups (no runtime impact, no count impact)

Note that `test.each` does **not** reduce Vitest's reported test count — each row is still a test. These changes are for readability only; the unit-suite numbers in "Expected outcome" do not assume any reduction from them.

1. `src/lib/top-vaults/helpers.test.ts`: convert `getFeeModeLabel` (6), `getFeeModeDescription` (6), `getFormattedLockup` (7), `meetsMinTvl` (5), `isEligibleFrontpageVault` (4) to `test.each` tables. ~28 → ~5 tests, same assertions.
2. `src/lib/top-vaults/treasury-benchmark.test.ts`: `isPerpetualFuturesVault` 9 → 1 `test.each` over `[chain_id | flag, expected]`.
3. `src/lib/echarts/stablecoin-chain-heatmap.test.ts`: 658 lines for 3 tests. The file defines a local `createVault(overrides)` and then inlines five full `VaultInfo` literals (~80 lines each) anyway. Rewrite the fixtures with `createTestVault` from `src/lib/top-vaults/test-utils.ts` (or the local helper) → ~120 lines. Keep all three tests and their expectations byte-for-byte.
4. `src/lib/components/Profitability.test.ts` lines 102–112: the three `getLabel()` tests are all named "…for negative values" (the bodies test negative, zero and positive). Collapse into one `test.each([[-0.01, 'loss'], [0, 'no change'], [0.01, 'profit']])`.

## Sequencing

Three PRs, each independently green:

1. **PR A — deletions, rename, skips + the three biggest files.** Workstream 1; 2.1, 2.2, 2.3. Roughly half of the integration saving and all of the unit saving. The `chain-details` rename needs a run against production (`pnpm run test:e2e -- chain-details`).
2. **PR B — chart pages and static pages.** 2.4, 2.5, 2.6. Requires the table-driven active-state test in `charts-dropdown` to land in the same PR as the per-page deletions.
3. **PR C — vault detail block + unit tidy-ups.** 2.7, workstream 3. Update `docs/tests.md`: the "Search-snippet coverage" section names `head-meta.test.ts` as the `<head>` contract but never mentions `social-meta-tags.test.ts` — add that it owns og/twitter tags, the social-card image URL, decode and card-content checks; add that chart-page navigation active state is owned by `charts-dropdown.test.ts` and the "See charts" link row by each chart page's render test.

Each PR: `feat:` is wrong — use `chore:` or `test:`; no `CHANGELOG.md` entry. PR body sections: Why / Lessons learnt / Summary, per `CLAUDE.md`.

## Guardrails for whoever implements this

- Before deleting or merging a `test()`, `grep` its assertion strings across `src/**/*.test.ts` and `tests/**` and note in the PR where the surviving assertion lives. If nothing else asserts it, it moves — it does not disappear.
- Do not widen timeouts or add `waitForTimeout` to make merged tests pass; if a merged test flakes, split back along the state boundary, not per assertion.
- Re-run the JSON-reporter timing commands above after each PR and record before/after in the PR body.
- Run `pnpm run test:integration --workers=2` locally at least once before opening each PR — the known flake in `vaults/index.test.ts` shows only at 4 workers, and consolidation changes the scheduling.
- Keep the `describe`/`test` naming style of the surrounding file (`it` vs `test`), UK spelling in test names.

## Expected outcome

|                                    | Before       | After (target)                                                                                                                                                                                |
| ---------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit tests / time                  | 659 / 10.5 s | ~648 / ~4 s (−4 `reference-rates`, −7 `helper.test.ts`)                                                                                                                                       |
| Integration tests / aggregate time | 385 / 329 s  | ~290 / ~240 s (summing the keep lists: datasets −18, market-share −17, charts-dropdown −7, social −15, chart pages −14, static pages −16, detail block −4, plus the table-driven nav test +1) |
| CI `test` job test step            | ~4 m 13 s    | ~3 m 15 s                                                                                                                                                                                     |
| Test lines                         | ~15 250      | ~13 000                                                                                                                                                                                       |
| Files never executed               | 1            | 0 (renamed, not deleted)                                                                                                                                                                      |
| Permanently CI-skipped tests       | 5            | 0                                                                                                                                                                                             |
| Network calls in unit suite        | 4 (1 in CI)  | 0                                                                                                                                                                                             |

## Out of scope

- `search.test.ts`, `equity-compare.test.ts`, `navigation.test.ts`, `layout-shift.test.ts`, `mobile-layout.test.ts`, `head-meta.test.ts`, `sitemap-index.test.ts`, `strategies.test.ts`, `announcement.test.ts`, blog tests: one behaviour per test; slow only because the pages are heavy. Leave alone.
- Making the integration suite shard across CI runners — worth doing separately if the wall time still matters after this.
- Fixing the `vaults/index.test.ts` 4-worker flake — tracked in the memory note; separate change.
