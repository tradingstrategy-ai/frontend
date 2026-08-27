# Rework vault filter groups

## Goal

Reorganise the expanded vault-table Filters panel into three clearly labelled groups without regressing existing URL state, defaults, dropdown behaviour, disclosure persistence, or conditional availability. Add a URL-backed three-month volatility filter. Use the existing `--viewport-sm-down` boundary so the groups sit side by side with vertical separators on desktop and tablet widths, then stack on mobile.

## Current implementation

- `src/lib/top-vaults/TopVaultsTable.svelte` renders every control inside `.filters-content`, split between implementation-oriented `.primary-filters` and `.secondary-filters` wrappers.
- The return-column selector is currently the last secondary filter and is labelled “Returns columns displayed”.
- The latest filter set includes Currently closed, conditional Unknown protocols, and conditional Private checkboxes.
- At widths above 768px the filters use the standard `<details>` disclosure. At widths up to 768px a separate mobile trigger reveals the same content.
- `tests/integration/vaults/index.test.ts` covers the disclosure at desktop and mobile sizes, but its assertions depend on the old `.primary-filters` structure and old checkbox labels.

## Implementation plan

### 1. Replace the structural filter wrappers

Update the expanded filter markup in `src/lib/top-vaults/TopVaultsTable.svelte` to render a group layout containing three semantic sections. Give each section a visible subheading and connect it to the section with `role="group"` plus `aria-labelledby` (or equivalent native fieldset/legend semantics), so “Hide vaults” remains part of the accessible context for its shortened checkbox labels:

1. **Display**
   - Move the existing return-column multi-select here.
   - Change its visible field label from “Returns columns displayed” to “Columns”.
   - Preserve `return-columns-trigger`, `return-columns-menu`, the selected-column summary, checkbox options, and `onReturnColumnToggle` behaviour.
2. **Hide vaults**
   - Move every hide checkbox here.
   - Rename the visible checkbox labels to “Currently closed”, conditional “Unknown protocols”, and conditional “Private”; retain the existing explanatory tooltips so the meaning remains explicit without repeating “Hide” in each label.
   - Render the Hide checkboxes as a vertical list at every viewport.
   - Preserve the current `closed` and `unknown` search-parameter updates, defaults, and conditional rendering.
3. **Performance**
   - Move all remaining controls here: Technical risk, Min TVL, Age, Max drawdown, Monthly returns, and Volatility.
   - Preserve each existing control's tooltip, dropdown/select state, option ordering, disabled states, and URL updates.
   - Add Volatility options for Any (default) and strict upper bounds of 5%, 10%, 25%, and 50%, persisted through the `vol` search parameter and applied consistently by browser and server listing filters.

Give the sections stable `filter-section-*` styling classes and `filter-group-display`, `filter-group-hide`, and `filter-group-performance` test IDs instead of retaining the misleading `primary`/`secondary` names. Keep `filters-note` after the three-section layout, rather than inside one group, so it spans the full filter panel on category pages. Shorten and soften that note, with “See all vaults.” as its link. Update the `showUnknownFilter` and `defaultHideUnknown` prop comments so they describe the renamed checkbox rather than preserving obsolete UI copy.

### 2. Add the responsive grouped layout

Refactor the component-scoped filter CSS in `TopVaultsTable.svelte`:

- Use mobile-first styles: stack the sections at widths up to 768px, which this component already treats as mobile by switching to `mobile-filters-trigger`; use the three-column treatment at `--viewport-md-up` (greater than 768px). Treat 900px as the representative tablet test width so the breakpoint decision is explicit and matches the component's existing disclosure behaviour.
- Size the columns as `auto auto minmax(0, 1fr)` rather than equal thirds: Display and Hide should take only the space they need, while Performance receives the remaining width. Allow the Performance controls to wrap within that column so narrower tablet widths do not force panel overflow.
- Add a vertical divider between adjacent groups using a border on the second and third sections, with padding to keep headings and controls clear of the line.
- At `--viewport-sm-down`, switch the section layout to one column, remove the vertical borders and associated inline padding, and let each group's controls wrap naturally beneath its subheading.
- Style the subheadings like the headings in vault information boxes and use spacing, rather than replacement horizontal rules, to separate the stacked mobile sections. Retain the current outer panel, desktop `<details>` summary, mobile trigger, dropdown positioning, and checkbox sizing.
- Do not add overflow clipping or new stacking contexts to the section wrappers: the absolutely positioned return and Performance option menus must remain visible above adjacent groups and outside their own column.
- Check that tooltip triggers and popups remain readable at desktop, tablet, and mobile widths, particularly for the compact Hide group and the wrapping Performance controls.

### 3. Update focused integration coverage

Revise `tests/integration/vaults/index.test.ts` to stop locating controls through `.primary-filters` and instead assert the new semantic groups:

- In the desktop disclosure test, verify the Display, Hide vaults, and Performance subheadings and that the relevant controls appear in the correct group.
- Assert the new “Columns”, “Currently closed”, conditional “Unknown protocols”, and conditional “Private” visible labels, and ensure their former “Hide …” labels are absent.
- Verify the groups' accessible names include their headings, so the shortened Hide vaults checkbox labels do not reverse or obscure their meaning for assistive technology.
- Keep the existing checks for collapsed/open state, persisted disclosure state, URL-driven opening, category note, and return-column visibility.
- Update the mobile disclosure tests to use the new group test IDs. At a 375px viewport, verify all three sections are stacked in document order (increasing bounding-box top positions), have no inline separator border, and their controls become visible only after opening the mobile Filters trigger.
- Add a 900px tablet-width assertion that the standard disclosure is used, all three group bounding boxes share the same top position, Display has no leading border, and Hide and Performance have a visible leading border.
- Extend the existing “Filters controls update URL state” coverage to toggle Currently closed and assert the `closed` parameter changes as expected. Retain the existing return-column toggle tests, which already prove the relocated Display control updates `returns` and renders the selected column.
- Assert every Volatility option, the `vol` URL update, and strict threshold behaviour at 10% in integration coverage. Cover exclusion of vaults without volatility data and invalid-parameter fallback in the listing query unit tests.
- Exercise the default positive conditional case on `/vaults`, where `showUnknownFilter` defaults to true, and a protocol listing where it is explicitly false, so both presence and absence of the Unknown checkbox are covered. Search all source and test files for the retired wrapper classes and labels so no selector, assertion, snapshot, or prop documentation is left stale.

## Verification

1. Run Prettier on the modified Svelte and integration-test files.
2. Run `pnpm run check src/lib/top-vaults/TopVaultsTable.svelte`.
3. Run the focused vault integration test file with the repository's integration-test command/filter supported by the Playwright configuration.
4. Start the Vite development server according to `.claude/docs/worktree.md` and inspect the expanded Filters panel at representative desktop, 900px tablet, and 375px mobile widths. Confirm group order, dividers, stacking, wrapping, tooltip widths, dropdown menus are not clipped or layered behind another section, and toggling each control still updates the expected URL state.
