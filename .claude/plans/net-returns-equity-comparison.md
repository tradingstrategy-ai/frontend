# Net returns equity comparison

## Goal

Extend the recently merged multi-vault comparison chart so users can switch
between the existing gross share-price index and a fee-aware net returns index.
Net is the default whenever every selected vault has a complete, usable investor
fee schedule. Gross must preserve today's series, alignment, range behaviour,
benchmarks, colours, tooltips, and CAGR calculations.

The net chart models what the same indexed starting capital would be worth after
known investor-facing fees over the currently selected chart period. It must
include entry, management, performance, and exit fees, and make positive entry
and exit fees visible as discrete dips on the first and last plotted day.

## Source review

The comparison feature landed in commit `8e849345d` (`feat: add multi-vault
equity comparison`). Its important implementation boundaries are:

- `src/routes/vaults/compare/chart-data/+server.ts` queries gross hourly
  `share_price` history, aligns complete vault histories once, resamples them to
  4-hour and daily buckets, and calculates gross period metrics.
- `src/lib/top-vaults/equity-comparison/equity-curves.ts` owns the pure gross
  alignment, resampling, benchmark indexing, and CAGR helpers.
- `src/lib/top-vaults/equity-comparison/VaultEquityComparisonChart.svelte`
  renders the server-prepared series and delegates visible-range selection to
  `ChartContainer`.
- `src/routes/vaults/compare/+page.svelte` owns URL state, the selected-vault
  cards, the chart request, and the selected period.
- `src/routes/vaults/compare/+page.server.ts` already has the selected full
  `VaultInfo` records, so it can project the small fee profile needed by the
  browser without another request.

Commit `384e31be5` (`feat: clarify vault gross and net returns`) established the
fee semantics that this work must retain:

- `net_fees` is the investor fee schedule used for net returns.
- Internalised management and performance fees are already reflected in the
  share price and must not be deducted a second time.
- External fees are applied in entry, management, performance, then exit order.
- Management fees use a 365.25-day year and performance fees apply only to
  positive profit after management fees.

The parquet contains no historical fee crystallisation events or net share-price
series. The chart must therefore be labelled and documented as a fee-adjusted
hypothetical net value, not an exact reconstruction of past investor balances.

## Product and calculation decisions

### Return mode and availability

- Add `gross` and `net` as an accessible radio group directly below the static
  `Returns index` subheading. Use sentence-case labels `Gross` and `Net`.
- Add a canonical, always-explicit `return=net|gross` comparison URL parameter
  as a first-class member of the persistent comparison state alongside
  repeated `vault`, repeated `benchmark`, and `period`. Default missing or
  invalid values to `net`, so refreshes, copied/shared URLs, and browser
  back/forward navigation restore the selected mode.
- Net is available only when at least one vault is selected and every selected
  vault has a usable fee profile. Benchmarks do not affect eligibility.
- Treat an empty vault selection as a pending Net default, not as a gross-only
  comparison: retain `return=net` while empty. Adding the first eligible vault
  therefore opens in Net. Adding a gross-only vault instead automatically
  selects Gross.
- If any selected vault is gross-only because its full applicable fee schedule
  is unavailable, automatically select Gross, write `return=gross`, and disable
  Net. This rule applies on initial load and whenever a vault is added.
- Do not automatically switch a user back to Net after they explicitly selected
  Gross, or after Gross was selected because a gross-only vault was present.
  Removing the final blocking vault makes Net available again but leaves Gross
  selected until the user changes it.
- When Net is disabled, place a focusable help trigger next to the radio control
  with a keyboard- and touch-accessible tooltip. The tooltip must say that Net
  needs full fee information for every vault and render a semantic bullet list
  (`<ul><li>`) containing every blocking vault name. Do not attach the only
  explanation to the disabled radio because disabled controls cannot receive
  focus.

Create a pure normaliser such as `getComparisonFeeProfile()` rather than
scattering nullable-field checks across Svelte components. A profile is usable
when:

- `net_fees.fee_mode` is known;
- every fee rate needed for an additional deduction is finite and in its valid
  range (`0 <= management/performance <= 1` and `0 <= entry/exit < 1`);
- `feeless` is explicitly normalised to four zero rates; and
- for an internalised mode, management and performance are normalised to zero
  additional deductions, while entry and exit rates must still be known.

Treat `null` as unavailable for every applicable rate; the schema's nullable
value means the source did not provide a usable number, not that the rate is
zero. The only exception is an explicit `fee_mode: 'feeless'`, whose semantics
authoritatively normalise all four rates to zero. For internalised modes,
management/performance are non-applicable to the frontend deduction because the
share price already contains them, but deposit and withdrawal must still be
numeric. For externalised mode, all four rates must be numeric.

Do not silently interpret an unknown applicable rate as zero. Use the structured
`net_fees.fee_mode` when producing the normalised profile; do not let a
conflicting legacy flag override it. Add a regression test for conflicting
legacy and structured values so the decision stays explicit.

### Net curve definition

Keep `alignVaultEquityCurves()` and the gross response untouched. For the active
time span, clip each already-aligned gross series to the same visible range used
by `ChartContainer`, then derive the net series from that vault's first and last
visible samples. This gives range changes the requested entry/exit semantics
without re-querying parquet or changing Gross.

For a vault whose first visible gross index is `A`, define:

```text
entryRate = investor deposit fee
invested = A * (1 - entryRate)
grossFactor(t) = grossIndex(t) / A
grossValue(t) = invested * grossFactor(t)
yearFraction(t) = (t - start) / (365.25 days)

managementFee(t) =
  invested * normalisedManagementRate * yearFraction(t)

profitAfterManagement(t) =
  max(0, grossValue(t) - invested - managementFee(t))

performanceFee(t) =
  normalisedPerformanceRate * profitAfterManagement(t)

netBeforeExit(t) =
  max(0, grossValue(t) - managementFee(t) - performanceFee(t))

netAtEnd = netBeforeExit(end) * (1 - exitRate)
```

This matches the calculation order documented for the detail-page example and
prevents an approximation from producing an impossible negative investor
balance. Management accrues against initial invested capital because that is the
existing frontend/backend example contract. Real management fees are commonly
charged against evolving AUM, so the fixed-base calculation may understate fees
in a rising market and overstate them in a falling market; disclose this
approximation alongside the missing crystallisation/high-water-mark history.
Calculating performance accrual at every point makes the curve represent the
hypothetical net value if the position were exited at that observation. It does
not claim to reconstruct high-water marks or crystallisation events, which are
not present in the frontend dataset. Mention this limitation in the chart
tooltip/documentation.

Apply the formula independently to each vault after the existing gross
alignment. Retaining the gross coordinate system means toggling Gross/Net shows
only the effect of fees and does not move younger vaults to a new comparison
anchor. For a vault that begins after the global window start, its first actual
visible sample is its entry point. For a vault whose history ends before the
global window end, its last actual visible sample is its exit point. Never
invent history outside a vault's observed range.

### Visible entry and exit dips

Positive one-time fees need explicit boundary geometry; merely scaling the
whole series would hide them.

- At entry, the first Net point deliberately shows the gross-aligned value `A`
  before fees. Insert a second point immediately after it with value `invested`;
  together they are the visible entry-fee dip.
- At exit, replace the original final sample with two boundary points. The point
  at `end - epsilon` carries the fully calculated `netBeforeExit(end)` value,
  not an interpolated earlier value, and the point at the original `end`
  timestamp carries `netAtEnd`.
- Choose a deterministic synthetic offset smaller than the gap to the adjacent
  real/resampled point, keep timestamps strictly increasing, remain within the
  same UTC calendar day when timestamp space permits, and never extend beyond
  the chart range. If adjacent timestamps leave no room for a synthetic point,
  apply the fee at the boundary and retain its fee-event metadata so the fee is
  never skipped. Comparison points are numeric `UTCTimestamp` values even in the daily bucket, so
  intra-day boundary points are supported; confirm this with a focused
  lightweight-charts render test before fixing the exact offset. Prefer an
  offset large enough for crosshair magnet selection while still looking like a
  discrete dip. If the renderer cannot make both requirements reliable, use a
  same-day fee-event marker/annotation plus the boundary value rather than
  silently collapsing the dip.
- Insert boundary pairs only for positive entry/exit rates. Zero-fee vaults do
  not need duplicate flat points.
- Attach optional `after-entry`, `before-exit`, or `after-exit` metadata to
  synthetic points so the crosshair explains each artificial boundary
  observation.
- If fewer than two distinct timestamps are available, do not manufacture a
  curve or CAGR; return the fee-adjusted liquidation point and a null metric.

Do not use a step-line style for the entire series: only the fee events should
look discrete, while share-price performance remains the same interpolated line
as Gross.

### Metrics and benchmarks

- In Gross mode, continue using the endpoint's existing `periodMetrics` values
  byte-for-byte.
- In Net mode, calculate each selected card's CAGR from the first pre-entry
  value and final post-exit value of the displayed net series. Keep the `Since`
  date tied to the first actual visible sample.
- Keep annualised CAGR for consistency with today's cards, but explain that
  annualising one-time entry/exit fees can dominate short windows. Pin the 1M
  behaviour in a test so the large short-period effect is deliberate.
- Keep the chart heading and accessible label as `Returns index`. Update its
  tooltip copy with mode-specific semantics, including which fees are included
  and that internalised fees were already present in share price.
- Leave Treasury, ETH, and BTC series numerically unchanged in both modes. They
  do not have vault fee schedules. In Net mode, clarify in the heading tooltip
  that fee deductions apply only to vault curves.
- Keep vault and benchmark colours, legend order, no-overlap status, partial
  benchmark failures, and range clipping unchanged.

## Proposed implementation

### 1. Extend comparison types and URL state

In `src/lib/top-vaults/equity-comparison/types.ts`:

- add `ComparisonReturnMode = 'gross' | 'net'` and its fixed option list;
- add a compact `ComparisonFeeProfile` containing only the normalised rates to
  deduct (internalised management/performance rates are zero);
- extend `ComparisonVault` with either a usable fee profile or a typed
  unavailable reason; and
- extend chart-point metadata, if necessary, with the optional fee-event tag.

In `src/lib/top-vaults/equity-comparison/state.ts`:

- parse and serialise `return`, defaulting to `net`;
- include it in `EquityComparisonState` and every `writeEquityComparisonState()`
  call;
- preserve it through add/remove vault, benchmark, period, table, and unrelated
  query-string changes;
- read the selected radio state from the URL on initial load and browser
  back/forward navigation, and update the URL with `replaceState` when the user
  changes Gross/Net so the mode behaves like the other persistent chart
  parameters without creating a history entry for every toggle;
- always serialise the mode explicitly, including `return=net` for an empty
  comparison; and
- keep these helpers syntactic only. They validate supported values but do not
  decide fee eligibility.

Make `+page.server.ts` the single owner of eligibility-aware canonicalisation.
After resolving selected vault records and fee profiles, it chooses the
canonical mode once: preserve requested Gross; preserve pending Net for zero
vaults; preserve Net when all vaults are eligible; otherwise force Gross. Fold
this into the loader's existing single 307 redirect so a hard load cannot
redirect to Net and then be replaced with Gross by the client. Client mode
clicks use `replaceState` only after the loader has supplied eligibility, while
add/remove navigations let the loader canonicalise the resulting selection.

Update `state.test.ts`, the server loader's canonical redirect assertions, and
`preserveSearchParams` on the selected comparison table. Cover missing,
invalid, and duplicate `return` parameters as well as empty, all-eligible, and
gross-only selections.

### 2. Project and validate fee profiles

Add a browser-safe pure module such as
`src/lib/top-vaults/equity-comparison/net-returns.ts`. It should own:

- fee-profile normalisation and eligibility;
- net point generation, including boundary fee events; and
- net period CAGR calculation.

Use the same existing `resampleTimeSeries()` and `getDataRange()` primitives as
`ChartContainer` when deriving the comparison's visible numeric range. Keep
this composition local to the comparison module so the shared chart shell and
Gross path remain unchanged.

`+page.server.ts` should call the normaliser for each selected `VaultInfo` and
include only the compact result in `ComparisonVault`. Do not send new price
history or duplicate the complete top-vault response. The existing
`selectedTopVaults` payload remains unchanged for the table.

The chart-data endpoint should continue returning gross chart series and keep
its current cache key (`vaultIds`, `benchmarks`). Return mode and period must not
trigger another DuckDB scan because both transformations are deterministic from
the already returned gross buckets and compact fee profiles.

### 3. Add the chart radio selector

Add a dedicated return-mode control to
`VaultEquityComparisonChart.svelte`, or add a narrowly scoped optional
`headerControls` snippet to `ChartContainer.svelte` if that produces a cleaner
responsive header. The control must:

- use real radios in a labelled `fieldset`/`legend` or an accessible radiogroup;
- expose checked and disabled state to assistive technology;
- when Net is disabled, render a separate focusable tooltip trigger whose popup
  explains the all-vault requirement and contains a semantic bullet point for
  each blocking vault;
- call an `onReturnModeChange` callback owned by the page; and
- wrap below the title/time selector cleanly on small screens without making
  chart tooltips wider.

Avoid changing the behaviour of the existing period `SegmentedControl`. If the
shared `SegmentedControl` is reused, first add explicit per-option disabled
support and tests; do not rely on CSS alone to make Net appear disabled.

### 4. Derive the active chart and card data

In `+page.svelte`:

- derive `netAvailable` and the list of blocking vault names from
  `selectedVaults`;
- trust the loader's eligibility-aware mode after navigation rather than running
  a competing client canonicaliser;
- automatically display Gross when the loader marks any selected vault as
  gross-only, while leaving an empty selection's pending default as Net;
- pass the selected return mode, availability, reason, and change callback to
  the chart;
- keep mode changes client-only so they do not refetch selected-vault metadata
  or chart data; and
- derive selected-card metrics from net points only in Net mode.

In `VaultEquityComparisonChart.svelte`:

- select the gross endpoint points unchanged in Gross mode;
- build fee-adjusted points for the active bucket and time span in Net mode;
- retain benchmark inputs unchanged;
- include the fee-event label in crosshair rows when the crosshair lands on a
  boundary point; and
- update heading, legend `aria-label`, and explanatory tooltip for the active
  mode.

Keep the transformation outside component-local imperative effects. It should
be a pure `$derived` call into the tested helper so switching mode or range is
synchronous and stale network responses cannot affect the calculation.

### 5. Update content and documentation

- Replace the HeroBanner's current gross-only disclaimer with copy explaining
  that Gross follows share-price performance and Net applies known fees over
  the selected period.
- Update `docs/chart-pages.md` with mode state, fee eligibility, boundary dips,
  internalised-fee handling, and the fact that return-mode changes do not hit
  parquet.
- Extend the return-and-fee section of `docs/vault-data-source.md` with the
  hypothetical point-in-time performance-fee interpretation, fixed-principal
  management-fee approximation, non-negative balance floor, and the absence of
  crystallisation/high-water-mark history.
- When this is implemented as a feature PR, add the required dated
  `CHANGELOG.md` entry.

## Verification

### Unit tests

Add focused coverage in `net-returns.test.ts` for:

- complete externalised, internalised, and explicitly feeless profiles;
- missing mode, missing applicable rates, `NaN`, infinity, negative rates, and
  entry/exit rates at or above 100%;
- no double deduction of internalised management/performance fees;
- entry-only and exit-only dips with strictly increasing timestamps inside the
  selected range;
- all four external fees in the documented order with hand-calculated values;
- management-fee prorating over 30, 90, 180, 365, and lifetime windows;
- a near-zero gross path over a long window proving the investor balance never
  becomes negative;
- performance fees only on positive profit after management fees;
- a path that rises then falls, demonstrating that the curve is a hypothetical
  liquidation value rather than a reconstruction of crystallised fees;
- range changes applying entry/exit to the new first/last visible samples;
- a younger vault using its first observed sample and an exit-fee-only vault
  whose history ends before the global range using its mid-chart final sample;
- 4-hour and daily buckets, single-point/empty series, and collision-safe
  synthetic timestamps, including a lightweight-charts render assertion for
  the chosen same-day boundary geometry;
- net CAGR including both one-time fees and a pinned 1M annualised result;
- zero-fee externalised Net producing points and CAGR identical to Gross for
  every period;
- Gross metrics remaining unchanged; and
- benchmarks remaining byte-identical across Gross and Net.

Extend state tests for default Net, Gross round trips, invalid values, and
preservation through every comparison-state update. Add component coverage for
the disabled Net radio, focusable tooltip trigger, explanatory text, and one
semantic list item per blocking vault.

### Integration tests

Extend `tests/integration/vaults/equity-compare.test.ts` with deterministic fee
profiles and chart payloads to prove:

- an eligible default comparison opens in Net mode, and an empty comparison
  retains pending Net so its first eligible vault also opens in Net;
- switching Gross/Net updates the URL, curve endpoints, and selected
  CAGR without another `chart-data` or page-data request;
- Gross reproduces the existing mocked chart values exactly;
- positive entry and exit fees create visible first-day and last-day drops;
- changing 1M/3M/6M/1Y/Max moves both fee boundaries and recalculates CAGR;
- adding a vault without fee information switches to Gross and disables Net
  with every blocking vault rendered as a bullet point in the tooltip;
- removing that vault leaves the user's Gross selection stable while making Net
  selectable again;
- loading or failing a chart-data request does not change the chosen mode, and a
  late response cannot restore a stale mode or series;
- internalised-fee vaults do not have management/performance deducted twice;
- benchmark values do not change between modes; and
- desktop and mobile headers keep both radio and period controls usable.

Update compare metadata/canonical URL tests if the public canonicalisation rules
include the return mode, and keep the private-R2 test focused on data access
rather than duplicating fee-calculation assertions.

Run focused tests first, followed by:

```shell
pnpm run format
pnpm run check
pnpm run test:unit --run
pnpm run test:integration
```

For manual verification, follow `.claude/docs/worktree.md`, run the Vite dev
server, and inspect `/vaults/compare` with Playwright at desktop and mobile
sizes. Verify the boundary dips visually for a vault with non-zero entry and
exit fees and use the crosshair to confirm their event labels.

## Implementation sequence

1. Add return-mode URL state and compact fee-profile types with state tests.
2. Implement fee normalisation and pure selected-period net transformations
   with hand-calculated unit tests.
3. Project fee profiles from the page loader without changing the parquet
   endpoint or its cache contract.
4. Add the accessible Gross/Net chart selector, bullet-list unavailable
   tooltip, and loader-owned gross-only reconciliation.
5. Feed transformed points and mode-correct CAGR values into the chart and
   selected-vault cards while preserving Gross and benchmarks.
6. Update comparison copy, documentation, integration fixtures, and responsive
   assertions.
7. Format and run focused, unit, integration, and manual visual verification.

## Acceptance criteria

- Net remains the pending default with no selected vaults and is selected by
  default whenever all selected vaults have usable fee data. Selecting any
  gross-only vault automatically selects Gross and disables Net.
- The mode is shareable/restorable from the URL and changing it does not query
  DuckDB or refetch chart data. The explicit `return` parameter is preserved
  together with `vault`, `benchmark`, and `period` through every comparison
  state update and browser navigation.
- Net applies known entry, externalised management, externalised performance,
  and exit fees over the active period, without double-counting internalised
  management or performance fees.
- A positive entry fee produces a first-day dip and a positive exit fee produces
  a last-day dip for each vault's actual visible history.
- Net card CAGR is calculated from the hypothetical pre-entry starting capital
  and post-exit end value; Gross card CAGR remains today's value.
- Gross mode returns the exact current curves, alignment, metrics, benchmarks,
  interaction behaviour, and partial-failure handling.
- Treasury, ETH, and BTC values are identical in both modes and are clearly
  described as not having vault fees applied.
- Missing or invalid fee information for any selected vault prevents a partial
  or misleading net comparison. A focusable tooltip beside the disabled Net
  radio explains the requirement and lists every blocking vault as a semantic
  bullet point.
