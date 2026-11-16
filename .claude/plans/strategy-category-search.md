# Strategy categories in sitewide search

## Goal and scope

Make registered, publicly visible strategy categories discoverable in navigation
search and `/search`. For example, searching `directional trading` should return
**Directional trading**, labelled **Strategy category**, linking to
`/vaults/strategies/directional-trading` and showing the category's TVL and
one-month APY.

This extends the existing server-side search index and shared result presentation.
Keep the current ranking, limits, caching, keyboard navigation and vault-only
comparison selector behaviour. Category terms will match category records only;
adding category aliases to individual vaults is outside this change.

## Existing support

- `src/lib/search/vault-search.server.ts` builds the index from cached `TopVaults`
  and stablecoin metadata. Both search entry points use `searchVaultEntities()`.
- `TopVaults.categories` already supplies labels, descriptions, TVL and APY.
  Category pages use source aggregates rather than recomputing member metrics.
- `src/lib/top-vaults/categories.ts` already provides `isVisibleVaultCategory()`
  and `getVaultCategorySlug()`. The hidden `unknown` category must remain hidden.
- `Search.svelte` and the full results page use shared entity labels and colours.
  Results with `vaultId: null` have no vault sparkline.
- The comparison selector uses an explicit allowlist of vault entity types.

## Implementation

1. In `src/lib/search/entities.ts`, extend `SearchEntityType` with
   `strategy-category`, display label `Strategy category`, and a colour mapping.
   Add the corresponding semantic colour token in
   `src/lib/components/css/color.css`, with readable dark and light values,
   following the existing search entity conventions and `docs/theme.md`.
   Keep the existing `SearchResult` shape.

2. In `buildIndex()` in `src/lib/search/vault-search.server.ts`, iterate over
   `Object.entries(topVaults.categories)` and skip tags rejected by
   `isVisibleVaultCategory()`. Add one record per visible category:
   - `id: strategy-category:<source-tag>` and `entityType: strategy-category`;
   - `name: category.label`;
   - `href: /vaults/strategies/<getVaultCategorySlug(tag)>`;
   - `latestTvl: category.tvl_usd` and `averageApy1m: category.one_month_apy`;
   - `vaultId`, `address`, `protocolName`, `chainName` and `logoUrl`: `null`.

   Pass the source tag as a matching term; `addRecord()` already includes the
   name. Existing normalisation makes spaces, underscores, dashes
   and case variations equivalent. Include zero-vault categories and preserve
   null APY. An empty category registry adds no records.

   Use source metrics, as the category index/detail pages do. Categories overlap
   and their aggregates can differ from search's other eligible-vault aggregates;
   do not recompute category totals or treat categories as additive groups.
   Do not index descriptions, infer categories from vault tags or add synonyms.

3. Update the empty-query help in `src/lib/search/components/Search.svelte` and
   relevant subtitle, metadata and search guidance in
   `src/routes/search/+page.svelte` to mention strategy categories. Retain the
   compact navigation input and trigger labels. Shared rendering should display
   the new type without special row markup, new tooltips or a category logo.

4. Update `docs/search.md` to include category results, label/tag matching,
   canonical strategy links and source-provided category metrics. Clarify that
   the existing eligible-vault aggregation rule applies to the other aggregate
   entity types. Keep TVL ordering for typeahead and existing relevance selection
   and table sorting on the full page; add no category promotion or grouping.

## Focused verification

Extend existing tests rather than creating a new test harness:

- In `src/lib/search/vault-search.server.test.ts`, cover label/tag matching across
  case and separator variants, the public result fields and canonical dash URL,
  hidden `unknown`, an empty registry, zero-vault categories and null APY.
  Choose source metrics that differ from member-vault metrics to prove they are
  used directly. Give changed fixtures distinct `generated_at` values so the
  existing module-level index cache cannot mask fixture changes.
- Include a mixed category/vault match to verify existing TVL ordering and a
  vault-type-filtered query to verify category exclusion from the selector.
- In `tests/integration/search.test.ts`, reuse the category data already present
  in `tests/mocks/top-vaults/list.mock.ts`. Add the new entity to existing entity
  coverage and exercise category selection in desktop and mobile typeahead, plus
  its label and link on `/search?q=directional+trading`. Reuse current keyboard
  and mobile helpers; do not build another viewport matrix or screenshot suite.
- Run the focused search Vitest tests, the existing suggestions endpoint tests,
  `pnpm run check`, and the search Playwright integration spec through the normal
  build-backed harness. Format changed files and run lint before committing.
- For a brief manual UI check, follow `.claude/docs/worktree.md`, use the Vite
  development server (`pnpm run dev`), and inspect category results on desktop
  and mobile in both colour modes. Confirm readable labels and metrics, no
  horizontal overflow, and navigation to the canonical category page.

## Acceptance criteria

- Visible registered categories are searchable by label or tag, including
  categories with no member vaults; `unknown` is absent.
- Category results show the correct type, source metrics and canonical link in
  typeahead and full results, with no vault sparkline or invented logo.
- Existing search ordering and vault-only selector filtering remain intact.
- No new endpoint, dependency, schema migration, cache layer, generic entity
  framework or category-specific rendering component is needed.

## Review and simplicity check

On 2026-11-16, attempted a no-tools Claude CLI review with the explicit model
`claude-opus-5-5`, streaming JSON output and the repository's timeout policy.
The CLI failed before model inference: `Failed to authenticate: OAuth session
expired and could not be refreshed`. `claude auth status` also reported
`loggedIn: false`. No Claude review findings were produced; the requested
independent review remains outstanding until local Claude authentication is
restored. Re-run that review against this file after signing in.

The primary agent checked the plan against the current search, category helpers,
category loaders and test fixtures, then performed a simplicity pass:

- Keep one category loop in the existing index and reuse the current result
  shape, shared UI, visibility/URL helpers, metrics and filtering.
- Index just the label and source tag. A separate slug alias is redundant because
  the existing normaliser already makes underscore and dash forms equivalent.
- Reuse current fixtures and tests. Distinct fixture versions avoid introducing
  cache reset APIs or changing production cache behaviour for tests.
- Keep verification focused on the changed search behaviour and a brief visual
  check. No new test harness, screenshot suite or selector-specific UI work.

No additional architecture is justified for this change. This simplicity pass is
the primary agent's assessment, not a substitute for the pending Claude review.

## Implementation status

Implemented on 2026-11-16 using the existing search index and shared result UI.
The focused search unit/endpoint/component tests pass (19 tests), and the search
Playwright integration spec passes (23 tests). Svelte checking reports no errors
and 17 existing warnings in unrelated files. The test build and lint pass.

Widget screenshots in `docs/pr-screenshots/strategy-category-search/` show the
category result at desktop (1440 × 1000), tablet (1024 × 1000) and mobile
(390 × 844) viewports. Browser validation uses the Vite dev server with existing
mock API data because the local private vault feed is not configured. The
build-backed integration harness ran on an isolated port to avoid other worktrees.
The earlier Claude authentication blocker is unchanged; no independent Claude
review is claimed.
