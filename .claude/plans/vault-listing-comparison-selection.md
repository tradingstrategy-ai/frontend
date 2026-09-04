# Select vaults for comparison from listings

## Goal

Let users select vaults directly from the top-vaults table and open the existing
`/vaults/compare` page with that ordered selection prefilled. The interaction
must be available on `/vaults` and every related route that uses the shared
vault listing table, and it must remain usable at desktop, tablet, and mobile
viewports.

Each rendered vault row gets a checkbox in the existing first/rank cell, below
the rank number. Selecting at least one row highlights every selected row and
shows a persistent **Compare vaults** action aligned with the table's left edge,
immediately below the last selected row. While scrolling, it stays beneath the
fixed table heading or at the viewport's safe bottom edge.

## Current implementation and constraints

- `src/lib/top-vaults/TopVaultsTable.svelte` owns the shared table markup,
  filtering, sorting, progressive loading, responsive horizontal scrolling,
  row-wide detail links, and the CSS counter that renders each rank. Building
  selection here makes it available to the top page and the chain, protocol,
  curator, stablecoin, risk-rating, fund, and other listing variants without
  duplicating route code.
- Rows use a full-width `TargetableLink`. Any checkbox placed in a row must use
  the existing `targetable-above` treatment so pointer and keyboard interaction
  reaches the checkbox instead of the vault detail link.
- `/vaults/compare` already accepts ordered repeated `vault=<id>` query
  parameters. `src/lib/top-vaults/equity-comparison/state.ts` canonicalises the
  IDs, preserves insertion order, and enforces `MAX_SELECTED_VAULTS` (currently
  eight). The listing must reuse that contract rather than introduce another
  parameter format or limit.
- `TopVaultsTable` is also rendered inside the comparison page as the “Selected
  vault comparison” table. Selection controls should be disabled for this one
  consumer because the user is already on the destination page; all genuine
  listing consumers should enable them by default.
- The current direct consumers are `TopVaultsPage`, the funds page, and the
  comparison page; `RiskRatingsPage` and the remaining listing routes reach the
  table through `TopVaultsPage`. Re-run a repository-wide consumer search during
  implementation before relying on a default-enabled prop, so a newly added
  non-listing embed cannot acquire checkboxes accidentally.
- Rows alternate `--c-col-a` and `--c-col-b` cell backgrounds, and swap that
  alternation when the chain column is present. The selected-row rule must
  override both paths across every cell while preserving blacklisted-row and
  row-link behaviour.
- The repository has no `theme.css`; the active theme colour source is
  `src/lib/components/css/color.css`, imported through `index.css` and described
  in `docs/theme.md`. Add the selection colour there as a semantic token rather
  than hard-coding a colour inside the table.

## Implementation plan

### 1. Add local ordered selection to the shared table

Update `src/lib/top-vaults/TopVaultsTable.svelte`:

- Add a boolean prop such as `allowVaultComparison`, defaulting to `true`, so
  all existing listing pages inherit the feature. The loading skeleton should
  retain the rank-cell shape but should not render interactive checkboxes.
- Store selected vault IDs as an ordered array in component-local Svelte 5
  state. Toggle by immutable assignment so the checkbox state, row classes,
  action visibility, and destination URL all update reactively. Removing and
  reselecting a vault places it at the end, matching the comparison page's
  insertion-order contract.
- Keep selection independent of the current filtered/sorted/rendered rows.
  Sorting, changing a filter, or fetching a continuation batch must not silently
  clear a user's choices; a selected row regains its highlight whenever it is
  visible again. Reset selection when the listing identity changes (pathname,
  `listingKey`, or `listingScope`), even when SvelteKit reuses the same dynamic
  route component; navigating from one chain/protocol/stablecoin listing to
  another must not carry hidden selections across categories. Query-only
  sorting/filtering on the same pathname keeps the selection only while
  `listingKey` and `listingScope` are unchanged; a listing-identity change takes
  precedence regardless of how navigation encoded it.
- Import and enforce `MAX_SELECTED_VAULTS`. Once the limit is reached, mark only
  unchecked row controls `aria-disabled` and make their change handler a no-op;
  do not use native `disabled`, because the unavailable controls must remain in
  the keyboard tab order and announce why they cannot be selected. Keep checked
  controls operable so users can remove selections, and expose a visible/live
  “8 vault maximum” status beside the action when the limit is reached.
- Add a small helper to identify and toggle a selected ID, keeping the table
  markup declarative and avoiding mutations of `Set` or array state in place.

Do not place selection in the listing URL or server page data. It is transient
UI state until the user chooses **Compare vaults**, so filter/sort URLs remain
canonical and no continuation endpoint changes are required.

### 2. Put each checkbox below its row rank

Replace the empty body rank cell with a rank-and-selection layout while keeping
the CSS counter as the source of the displayed rank:

- Keep the existing `.index` cell as the first column. Render the counter value
  above and a native checkbox below it; do not add another table column or shift
  every existing column.
- Wrap the checkbox in a `targetable-above` label/control and give it an
  accessible name such as “Select {vault name} for comparison”. The visible
  rank and checkbox must remain keyboard reachable and must not trigger the
  row-wide vault detail link.
- Bind `checked` to the ordered selection and `aria-disabled` to the shared
  maximum, with guarded pointer and keyboard handlers for unavailable controls.
  Expose stable test IDs or data attributes for the row, checkbox, and selected
  state where semantic role/name selectors are insufficient.
- Apply a selected class/data attribute to the `<tr>`, without removing its
  `targetable` or conditional `blacklisted` classes.
- Adjust the rank-column width, padding, vertical layout, and checkbox size at
  `--viewport-sm-down` so the rank and a touch-usable control fit without
  clipping. Preserve the table's current horizontal-scroll strategy and CSS
  counter behaviour as more rows are progressively appended.

### 3. Add a semantic selected-row colour

Update `src/lib/components/css/color.css` with a purpose-specific token such as
`--c-vault-row-selected`, defined for both dark and light themes from the
existing warm-neutral semantic palette. Update `docs/theme.md` to list its
purpose.

In `TopVaultsTable.svelte`:

- Add the selected-row cell rule after the alternating-column and chain-column
  rules with sufficient specificity to paint every selected cell with the new
  token.
- Preserve visible cell borders, text contrast, focus indication, and the
  blacklisted strikethrough treatment.
- The current table has no frozen body columns. Its heading is sticky only on
  full-width layouts because smaller viewports need horizontal scrolling. Still
  include the first/rank cell explicitly in the selected override and verify it
  after horizontal scrolling, so the highlight cannot appear broken at mobile
  widths or if that cell later gains an opaque/sticky treatment.
- Ensure the full-row hover link does not erase the selected state; use a
  token-derived hover/focus mixture for selected rows if the current row-link
  overlay otherwise masks the highlight.
- Verify the result in both colour modes rather than relying only on the default
  dark theme.

### 4. Build the prefilled comparison destination and persistent action

Reuse `writeEquityComparisonState` from
`src/lib/top-vaults/equity-comparison/state.ts` to build the action URL:

- Pass the selected IDs in click order, an empty benchmark list, and the
  comparison page's default `3M` period. This produces repeated encoded `vault`
  parameters and an explicit, shareable period. The presence of the `vault`
  parameters—not the period—prevents the compare-page loader from injecting its
  unrelated default Savings USDS selection.
- Resolve the `/vaults/compare` path through `$app/paths` so configured base
  paths continue to work. Use an anchor-style action (the shared `Button`
  component is suitable) so the destination is inspectable, openable in a new
  tab, and usable without a bespoke click-navigation handler.
- Render the persistent action only when at least one ID is selected. Keep the main
  visible text exactly **Compare vaults**, add a compact visible selected-count
  badge, and expose an unambiguous accessible name such as “Compare 3 selected
  vaults”.
- Position its wrapper at the table's left edge immediately after the last
  selected row. Clamp its fixed position below the table heading and inside the
  viewport's safe bottom edge with a deliberate stacking level, theme-derived
  surface/border/shadow, standard spacing tokens, and
  `env(safe-area-inset-bottom/left)` allowances. Ensure it does not create
  page-level horizontal overflow on narrow screens.

Set `allowVaultComparison={false}` on the `TopVaultsTable` instance in
`src/routes/vaults/compare/+page.svelte`. Its existing selected-vault cards and
remove controls remain the only selection editor on that page.

### 5. Add focused component coverage

Extend `src/lib/top-vaults/TopVaultsTable.test.ts` with deterministic vaults to
verify:

- each non-loading row has one correctly named checkbox inside its rank cell;
- checking a vault updates the native checked state, selected-row marker, and
  makes the floating **Compare vaults** link appear;
- selecting several rows preserves click order in repeated `vault` parameters,
  encodes IDs through the shared state writer, sets `period=3M`, and does not add
  implicit benchmark parameters;
- unchecking the last vault removes the floating action and row highlight;
- reaching `MAX_SELECTED_VAULTS` disables only unselected checkboxes; and
- the limit uses focusable `aria-disabled` controls, announces its status, and
  guards both pointer and keyboard attempts to exceed the limit;
- query-only sort/filter changes retain selections while a changed
  pathname/listing identity clears them; and
- `allowVaultComparison={false}` omits both row checkboxes and the floating
  action.

Where practical, also assert that the checkbox is marked `targetable-above` and
that the rank cell remains the first body cell. Leave URL canonicalisation and
limit edge cases in the existing equity-comparison state tests rather than
duplicating that helper's full test suite.

### 6. Cover listing-to-comparison behaviour responsively

Extend `tests/integration/vaults/index.test.ts` with one complete desktop flow at
1440px and focused layout/interaction passes at representative tablet (1024px)
and mobile (375px) widths:

- open `/vaults`, select two visible vaults by accessible checkbox name, and
  assert the checkboxes—not the row detail links—receive the interaction;
- assert both rows share the computed selected background while unselected rows
  retain their alternating backgrounds;
- confirm the persistent action is below the last selected row when it is
  visible, then remains beneath the fixed heading while scrolling, and causes
  no document-level horizontal overflow at tablet or mobile widths;
- in the desktop flow, activate **Compare vaults** and verify `/vaults/compare`
  receives the same two IDs in selection order and renders those vaults in its
  Selected vaults list;
- cover deselection and the eight-vault disabled state without relying on live
  chart-history responses; and
- verify query-only filtering/sorting retains the chosen IDs, while navigating
  between two values of the same dynamic listing route clears them;
- perform a small smoke assertion on one related listing route (for example a
  protocol or stablecoin detail listing) to prove the shared table enables the
  same control there.

Add an assertion to `tests/integration/vaults/equity-compare.test.ts` that the
comparison page's embedded summary table does not render listing-selection
checkboxes or another floating compare action.

## Documentation

Update `docs/vault-listings.md` to describe that listing selection is local to
the current page instance, survives in-page sorting/filtering/loading, is capped
at the comparison page's shared limit, and is transferred as ordered repeated
`vault` parameters only when the action is followed.

No server loader, listing endpoint, compare chart-data endpoint, schema, or
vault payload change is expected.

## Verification

1. Format the modified Svelte, TypeScript, CSS, and Markdown files.
2. Run `pnpm run check src/lib/top-vaults/TopVaultsTable.svelte`.
3. Run the focused `TopVaultsTable` unit tests.
4. Run the focused vault listing and equity comparison Playwright specs.
5. Run `pnpm run lint`, `pnpm run check`, and `pnpm run test:unit --run`.
6. Follow `.claude/docs/worktree.md`, start the Vite development server with
   `pnpm run dev`, and use Playwright against the development server to inspect
   desktop, tablet, and mobile layouts in dark and light modes. Check checkbox
   hit targets, rank alignment, row highlighting, floating-action safe-area
   spacing, horizontal table scrolling, keyboard focus, tooltips, and the final
   selected-vault order on `/vaults/compare`.
   Also check the floating action alongside any mobile bottom navigation,
   navigation drawer, search overlay, or consent UI that can coexist with the
   listing, and confirm stacking does not make either control unusable.

## Acceptance criteria

- Every genuine `TopVaultsTable` listing lets a user select up to the existing
  comparison limit, with the checkbox directly below the row rank.
- Selecting rows never follows the row detail link, and all controls work with
  pointer and keyboard input.
- Selected rows use a dedicated semantic background colour with readable light-
  and dark-theme contrast.
- One or more selections reveal a table-left **Compare vaults** action that
  stays within desktop, tablet, and mobile viewports while scrolling.
- Following the action opens `/vaults/compare` with exactly the selected vaults
  in selection order and no injected default vault.
- Filtering, sorting, and progressive loading do not clear the current local
  selection.
- The comparison page's own summary table does not show a recursive selection
  action.
- Focused unit and Playwright coverage verifies the state, URL, related-listing,
  accessibility, and responsive behaviour.
