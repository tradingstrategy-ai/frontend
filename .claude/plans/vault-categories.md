# Vault strategy listing pages

## Goal

Add a `/vaults/strategies` index and `/vaults/strategies/[category]` detail pages backed by the new category metadata and strategy tags in `top_vaults_by_chain.json`. Link the index from the shared vault navigation, show the source strategy description and aggregate metrics, and reuse the existing server-backed vault listing pipeline for each strategy. Former `/vaults/categories` URLs permanently redirect to the canonical strategy routes.

Strategy rows must be alphabetical by label on first load. Source-controlled category tags use underscores, such as `directional_trading`, while public URLs use dashes, such as `/vaults/strategies/directional-trading`.

## Confirmed data contract

The current private top-vault export has this relevant shape:

```ts
type VaultCategory = {
	label: string;
	description: string; // Markdown, including links
	vault_count: number;
	tvl_usd: number;
	one_month_apy: number | null;
};

type TopVaults = {
	// existing fields
	categories: Record<string, VaultCategory>;
	vaults: Array<{
		// existing fields
		strategy_tags?: string[] | null;
	}>;
};
```

`strategy_tags` is absent on a small number of records, `null` when no researched classification is available, and a non-empty array when the vault has one or more categories. Treat absent and `null` memberships as unclassified; do not place them in the `unknown` category unless the source explicitly supplies the `unknown` tag.

The top-level category aggregates are the source of truth for the index. Do not recalculate them with frontend eligibility rules, because the producer's category aggregation does not have exactly the same population as the interactive vault listing defaults.

Categories overlap: one vault can contribute to several category rows. Consequently, category TVLs and counts are not additive. Do not add a market-share pie or a summed category-total headline to the index, since either would imply mutually exclusive groups.

## Data and listing support

1. Extend `src/lib/top-vaults/schemas.ts` with a `vaultCategorySchema` and exported `VaultCategory` type, parse `strategy_tags` as an optional nullable string array, and parse the top-level `categories` record. Follow the per-entry resilience pattern used for `core3_protocols`: retain valid category records, drop malformed entries, and default a missing or wholly invalid map to `{}` without making the critical vault array unavailable. Emit a sanitised server warning when category metadata is dropped or the registry is unusable. An empty registry intentionally produces an empty index and makes category detail routes unavailable, while the rest of the vault experience remains available.
2. Keep `categories` out of browser payloads that do not need it. Add `categories: {}` to compact `TopVaults` objects created by `loadVaultListing()` and to typed fixtures/helpers that construct the full parsed shape, rather than serialising the complete registry with every listing page.
3. Add `category` to `VaultListingKey` and define it as a scope-required listing. Its scope predicate must use `(vault.strategy_tags ?? []).includes(scope)`, so multi-tag vaults appear on every applicable page and unclassified vaults do not leak into a category.
4. Give category detail listings the normal `10k` TVL default and make unknown-protocol and AMM-like vaults visible by default. In the current listing query polarity this means `unknown: false` and `amm: false`. A strategy category is independent of protocol recognition, and hiding AMM-like records would make categories such as `amm` and `market_making_amm` contradict their own scope.
5. Use the same category listing definition in the initial loader and `/top-vaults/listing-data` continuation endpoint. For a directly requested category scope that is absent from `topVaults.categories`, return an empty listing rather than matching an unregistered tag; the page loader itself still returns 404. Add focused query/endpoint tests proving that pagination/filtering cannot broaden the result beyond the requested tag and that absent, null, single-tag, multi-tag, and unknown scopes behave correctly.
6. Add small, category-specific URL helpers rather than reusing `slugify`, which drops underscores. Convert source tags to public slugs with `_` → `-`, and convert a route slug back with `-` → `_` before validating it against the category registry and applying the listing scope. Store source tags internally for `strategy_tags` comparisons and continuation scopes; expose only dash slugs in page links, canonical URLs, charts, and sitemap entries.

## Vault detail strategies

Add strategy links to every vault detail page that has registered `strategy_tags`:

1. In `src/routes/vaults/[vault=slug]/+page.server.ts`, read the parsed category registry and map the current vault's `strategy_tags` to a compact list of known `{ slug, label }` entries, where `slug` is the dash-form public URL slug. Sort this display list alphabetically by label, ignore tags no longer present in the registry, and return only this matched list with the page data rather than serialising the complete category registry.
2. Create `src/routes/vaults/[vault=slug]/VaultCategories.svelte` and render it immediately after `<VaultRankings>` in the detail page. The component must render nothing when the compact list is empty, so unclassified vaults do not gain an empty information block and category registry degradation remains non-fatal.
3. Render a concise, accessible line beginning with `Strategy categories:` followed by strategy-name links separated by literal commas. Each link uses `resolve('/vaults/strategies/<dash-slug>')`, with the source label as visible text, so every keyword navigates to its respective strategy page. Keep the links independently focusable and preserve readable wrapping on narrow screens; a long list must wrap between links without splitting or overlapping the comma separators.
4. Keep this presentation separate from ranking availability: strategy categories display below the ranking position when rankings are present and in the same position when the source has no ranking data. Do not treat the list as a return ranking or invent strategy-specific rank values.

## Strategy index

Create `src/routes/vaults/strategies/+page.server.ts` and `+page.svelte` following the protocols/chains index structure where it remains semantically valid:

- Map every entry in `TopVaults.categories`, including zero-vault categories, to a `VaultGroup` with the dash-form public slug, `label` as `name`, Markdown `description`, `vault_count`, `tvl_usd` as `tvl`, and `one_month_apy` as `avg_apy`.
- Extend `VaultGroup` with an optional `description` and extend `VaultGroupTable.svelte` with an opt-in description column. Render the cell through the existing `Markdown.svelte` component, with compact table typography and spacing. Keep Markdown links above the targetable row overlay so they remain independently clickable and keyboard accessible.
- Show the columns Strategy, Description, Vaults, Avg. APY (30d), and TVL using the existing formatters and responsive table/card behaviour. Do not add an unused sortable Description header.
- Parse `page`, `sort`, and `direction` with the shared URL helpers, but default to `sort=name&direction=asc` when absent. Preserve user-selected sorting in the URL and verify that source insertion order cannot affect the alphabetical default.
- Add collection-page metadata and JSON-LD using a plain-text page description. The source Markdown belongs in rendered category rows; do not place raw Markdown syntax in meta descriptions.
- Use the shared vault listing selector above the page heading. Keep the index header unframed and omit the market-share widget because memberships overlap.

## Strategy detail pages

Create `src/routes/vaults/strategies/[category=slug]/+page.server.ts` and `+page.svelte`:

1. Load the cached top-vault payload, convert the dash-form route parameter to its source tag, and resolve `categories[sourceTag]`. Return 404 only when the source key is absent. A known category with zero vaults remains a valid page. Redirect an incoming underscore-style URL to its dash-form canonical page URL.
2. Pass the resolved source tag to `loadVaultListing(fetch, url, 'category', sourceTag)` and return the category metadata alongside its paginated listing data.
3. Render the heading as `${category.label} vaults` and render `category.description` in-page with the shared Markdown component. Use a plain-text, strategy-specific sentence for HTML/social metadata and JSON-LD so Markdown links are not exposed as markup syntax.
4. Add a small strategy description/summary component using the existing `MetricsBox` visual pattern. Alongside the Markdown description, state the source `vault_count`, `tvl_usd`, and source-provided 30-day average `one_month_apy` when present. Label these as source strategy figures so they are not confused with the filter-sensitive listing summary shown around the table. Only describe the APY as TVL-weighted if that producer-side contract is documented and verified during implementation.
5. Reuse `TopVaultsPage` for the filters, table, empty state, and continuation loading. Pass the category listing key/scope and its shared defaults so browser controls and server queries remain aligned.
6. Add `/vaults/strategies/[category]/chart-data` by adapting the existing protocol/chain mini-chart endpoint: convert and validate the dash-form category slug, select vaults by the resolved source `strategy_tags` key, apply `isEligibleVaultGroupMiniChartVault`, and build/cache the standard TVL and returns payload. Have the page loader return whether at least one matching vault is chart-eligible and render `VaultGroupMiniChart` only then. The endpoint should return a valid empty payload for a known strategy with no eligible chart rows, while an unknown category slug returns 404.

Use the category key in endpoint cache keys and retain the existing public cache headers. The chart and listing may contain fewer vaults than the source aggregate because each applies its established eligibility/filter rules; the UI copy must distinguish these populations rather than silently claiming identical counts.

## Navigation and discovery

- Add `{ href: '/vaults/strategies', label: 'Strategies' }` to the primary links in `src/lib/top-vaults/VaultListingsSelector.svelte`. Verify wrapping and dropdown positioning at desktop, tablet, and mobile widths after adding the extra item.
- Extend `src/routes/vaults/sitemap.xml/+server.ts` with the strategy index and one dash-form detail URL for every visible key in the top-level category map, including zero-vault strategies. Sitemap and canonical URLs must never expose source underscores.
- Do not add strategies to global vault search in this change; the request is for vault navigation and listing pages, and search currently has its own entity ranking and payload contract.

## Tests and documentation

Update the top-vault mock dataset with representative category metadata and vaults covering one tag, multiple tags, null tags, and enough tagged rows to exercise continuation behaviour.

Add or extend focused coverage for:

- Schema parsing of valid categories and strategy tags, missing fields, per-entry salvage when one category record is malformed, and the empty-registry fallback.
- Category scope/default tests in `src/lib/top-vaults/listing/query.test.ts`, including preservation of unknown-protocol and AMM-like vaults.
- Vault detail strategy labels and links: a multi-tag vault renders alphabetically ordered, comma-separated links directly below rankings; null, absent, and unregistered tags render no line; every link targets the matching dash-form strategy route; and the line wraps without overlap on mobile.
- The strategy index's five columns, Markdown link rendering, zero-vault row, alphabetical default, URL-backed alternate sorting, and responsive layout without horizontal page overflow.
- Playwright visual checks of the strategy index at desktop, tablet, and mobile viewports. Capture screenshots at each viewport and assert that the desktop table remains readable, tablet content does not collide or clip, the mobile card layout preserves strategy name, description, metrics, and links, and the added vault navigation item wraps without obscuring the page heading or table controls.
- Strategy detail title, description, source stats, filtered listing summary, mini-chart, multi-tag membership, valid zero-vault/zero-chart-data states, unknown-strategy 404, dash-form route matching, legacy underscore-to-dash redirect, and progressive loading that remains in scope.
- Direct continuation requests for an unregistered category scope returning an empty result without exposing unrelated vaults.
- The new primary vault navigation link and its active state.
- Category index/detail sitemap entries using dash-form slugs only.
- HTML/social metadata and JSON-LD containing plain text rather than raw Markdown link syntax.

Update `docs/vault-data-source.md` with the `categories` and `strategy_tags` contracts and public strategy URLs, and `docs/vault-listings.md` with the `category` listing key/scope and the distinction between source aggregates and interactive listing summaries.

## Verification

1. Format all changed Svelte, TypeScript, test, and Markdown files.
2. Run the focused schema and listing-query Vitest tests.
3. Run the focused category, navigation, sitemap, and social-metadata Playwright integration specs against the mock API.
4. Run `pnpm run check`, `pnpm run lint`, and `pnpm run test:unit --run`.
5. Follow `.claude/docs/worktree.md`, start `pnpm run dev`, and use Playwright against the Vite development server. Inspect the index plus populated and zero-vault detail pages at desktop, narrow tablet, and mobile sizes; verify alphabetical order, Markdown links, table/card wrapping, navigation wrapping, filters, continuation loading, empty states, and chart rendering.
6. Capture and review Playwright screenshots of `/vaults/strategies` at representative desktop, tablet, and mobile viewports. Confirm that all content remains visible and legible, no elements overlap or cause horizontal page overflow, and table/card transformations retain the description and all required metrics. Store any intentional regression baselines with the relevant integration-test screenshots rather than relying only on DOM assertions.

## Acceptance criteria

- The vault navigation contains a working Strategies link.
- `/vaults/strategies` lists every valid visible source strategy alphabetically by label by default with its rendered description, TVL, vault count, and 30-day average APY.
- `/vaults/strategies/<dash-slug>` renders the strategy title and description, source aggregate summary, scoped vault listing, and TVL/returns chart when data exists.
- Vault detail pages show their registered strategy names immediately below the ranking area as comma-separated links to the matching strategy pages.
- Multi-tag vaults appear in every matching category; absent or null tags match none.
- Known zero-vault strategies render successfully, while unknown category keys return 404.
- Filtering, sorting, initial pagination, and continuation requests cannot escape the strategy scope.
- Strategy URLs are dash-form, canonical, and discoverable in the vault sitemap; underscore source tags never appear in public URLs.
- The strategy index is visually verified with Playwright screenshots on desktop, tablet, and mobile, with no clipping, overlap, unreadable Markdown descriptions, or horizontal page overflow.
- Existing vault listing, navigation, and responsive table behaviour remains intact.
