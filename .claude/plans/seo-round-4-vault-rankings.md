# SEO round 4 — rank vault pages for the terms people search

## Status (2026-09-25)

Planned; not started. Based on a Search Console API pull (90 days to 2026-09-24, plus before/after windows around the round 1–3 releases), Google Autocomplete for the seed terms below, and the SSR HTML of the live vault templates on 2026-09-25. Reviewed by Codex (`gpt-6-sol`, read-only) on 2026-09-25: its nine findings are folded in below and its seven ideas are workstreams 7–11 and the research item under "Outside this repository". Owner decisions: NewBet goes on the ignore list (workstream 0).

## Baseline findings that changed the plan (2026-09-25, workstream 6 tooling)

- `/vaults/protocols/morpho` and `/vaults/stablecoins/usdc` are **"Crawled – currently not indexed"**. Titles cannot make an unindexed page rank; workstream 3's page-specific content is what has to get these two hubs indexed, so they go first in it.
- Hyperliquid and HLP searches land on `/glossary/hyperliquid-provider-vault` (position 12.9) and the blog post `hyperliquid-vault-of-vaults`, not on vault pages. Workstream 8 therefore also adds a prominent link from that glossary term to the HLP vault page and the Hyperliquid hub.

Full baseline in `docs/google-webmasters.md`, "Round 4".

## Why

Rounds 1–3 (PRs #1435, #1437, #1440) fixed indexing, not ranking:

- **Indexing works.** 4,160 of the 4,233 URLs in `vaults/sitemap.xml` are indexed (98 %); 30 soft 404s, 36 discovered-not-indexed.
- **Spam traffic is gone.** Weekly site impressions went from 50–230K to ~27K; token-page clicks fell with them, as intended.
- **Vault traffic is roughly flat.** 682 → 806 impressions/day and 6.9 → 9.4 clicks/day (2026-08-18…09-15 vs 09-16…09-24). Without `/vaults/newbet` (795 impressions in 9 days for the query "newbet") impressions are +5 %.
- **We rank for names, not categories.** Nearly every vault impression is a navigational query for one vault or curator ("doubletop vault", `"alpha usdc delta v2" morpho vault`, "re7 vaults", "lighter vaults", "midas vaults", "ostium vault"). Category terms rank on page 4–7 or not at all:

| Query (90 days)                                                                                | Impressions | Position                     |
| ---------------------------------------------------------------------------------------------- | ----------- | ---------------------------- |
| hyperliquid vault / hyperliquid vaults                                                         | 1,263       | 11–14 (hub pages rank 39–49) |
| hlp vault, hyperliquid hlp, hlp vault apy, hlp vault returns                                   | ~900        | 8–20                         |
| defi vault / defi vaults                                                                       | 28          | 39–49                        |
| crypto vaults                                                                                  | 13          | 65                           |
| best defi vaults, stablecoin yield, usdc yield, morpho vaults, euler vaults, stablecoin vaults | 0           | not ranked                   |

The templates do not use the words people search:

| Page                         | Title today                                | H1 today                           |
| ---------------------------- | ------------------------------------------ | ---------------------------------- |
| `/vaults`                    | Top stablecoin vaults                      | Top stablecoin vaults              |
| `/vaults/chains/hyperliquid` | Hyperliquid stablecoin vaults              | Hyperliquid stablecoin vaults      |
| `/vaults/protocols/morpho`   | Morpho vaults and yields                   | Morpho powered stablecoin vaults   |
| `/vaults/stablecoins/usdc`   | Circle USDC stablecoin vaults              | Circle USDC stablecoin vaults      |
| `/vaults/curators/re7-labs`  | RE7 Labs curated stablecoin vaults         | RE7 Labs curated stablecoin vaults |
| `/vaults/<vault>`            | `<Name> \| DeFi vault \| Trading Strategy` | `<Name>`                           |

"Stablecoin vaults" is our wording, not a search phrase: Autocomplete completes it with nothing vault-specific, while "hyperliquid vaults", "morpho vaults", "hlp vault" and "usdc vault" each complete to vault-specific phrases. It is also not accurate everywhere: many listings are denominated in stablecoins, but `/vaults` is unfiltered and the chain and protocol scopes are not restricted to `stablecoinish` (`src/lib/top-vaults/listing/definitions.ts:162`), so hubs can include other denominations. Vault detail titles name neither protocol nor chain, although searchers type "<vault> morpho vault". Vault pages have a 1.25 % CTR at position ~8.

Page weight, Core Web Vitals and index hygiene are **out of scope**. Mobile CLS in CrUX is 0.10 (window mostly before round 3); recheck around 2026-10-15 with `pnpm run seo:cwv --history`.

## Search vocabulary

Everything below uses these phrases. Sources: our Search Console queries (what we already appear for) and Google Autocomplete (what people type for terms where we do not appear yet).

| Intent           | Phrases people use                                                                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Category         | defi vaults, best defi vaults, top defi vaults, defi yield vaults, crypto vaults, defi vaults explained                                                 |
| Stablecoin yield | stablecoin yields, best stablecoin yield, stablecoin yield comparison, best stablecoin interest rate, usdc vault, usdc yield                            |
| Protocol         | morpho vaults, morpho vault apy, morpho usdc vault, euler vaults, lighter vaults, lighter llp vault, midas vaults, aave vault                           |
| Hyperliquid      | hyperliquid vaults, best hyperliquid vaults, hyperliquid vault apy, hyperliquid vaults stats / analysis / review, hlp vault apy / returns / performance |
| Curator          | `<curator> vaults`, `<curator> morpho curator`, steakhouse usdc vault                                                                                   |
| Single vault     | `<vault name> vault`, `<vault name> <protocol> vault`, `<vault name> review`, `<vault> apy`                                                             |
| Metric words     | **APY** (not "annualised return"), returns, performance, TVL, risk, fees, stats                                                                         |

Rules: say **APY** in titles and headings (the table column and the methodology keep the exact definition); say **vaults**, not "stablecoin vaults", unless the page is about a stablecoin; say "stablecoin-denominated" only where the page's data supports it; put the entity name first; use "best" only where the page is actually ranked by performance.

## Intent map — one landing page per query intent

Several pages could otherwise compete for the same query and Google may consolidate them regardless of self-canonicals. Each intent gets one primary page, and each page gets visibly different analysis and internal anchor text:

| Intent                                                     | Primary page                                    | Not targeted by                                                        |
| ---------------------------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------------- |
| defi vaults, best defi vaults, top defi vaults             | `/vaults`                                       | hubs                                                                   |
| stablecoin yields, best stablecoin yield, yield comparison | `/vaults/stablecoins`                           | `/vaults`, coin hubs                                                   |
| usdc vault, usdc yield (per coin)                          | `/vaults/stablecoins/<coin>`                    | `/vaults/stablecoins`                                                  |
| `<protocol>` vaults, `<protocol>` vault apy                | `/vaults/protocols/<protocol>`                  | chain hub                                                              |
| hyperliquid vaults, best hyperliquid vaults                | `/vaults/protocols/hyperliquid` (native vaults) | `/vaults/chains/hyperliquid` says "vaults on Hyperliquid and HyperEVM" |
| hlp vault apy / returns / performance                      | the HLP vault detail page                       | Hyperliquid hubs                                                       |
| `<curator>` vaults                                         | `/vaults/curators/<curator>`                    | protocol hub                                                           |
| `<vault>` vault / apy / review                             | `/vaults/<vault>`                               | —                                                                      |

Confirm the Hyperliquid split against the data before PR 1 (which page lists the native Hyperliquid vaults, which lists HyperEVM).

## Workstream 0 — put NewBet on the ignore list

`/vaults/newbet` became the vault page with the most impressions (795 in 9 days, 1 click), all for the navigational query "newbet" — a gambling-brand search, the same pattern the EverPorn token page had. It passes the name blocklist because `NOINDEX_NAME_PATTERN` (`src/lib/explorer/indexing.ts:34`) matches `bet` only as a whole word.

- Add `\bnewbet\b` to `NOINDEX_NAME_PATTERN` (next to `casino|poker|jackpot`), whole-word so similarly prefixed names stay eligible. `New Bet` is already blocked by the whole-word `bet`. `isVaultIndexable()` applies `hasBlockedName()` to the vault name, and the same rule feeds the detail loader's `noindex,follow` (`src/routes/vaults/[vault=slug]/+page.server.ts:48`) and the sitemap filter (`src/routes/vaults/sitemap.xml/+server.ts:63`); the rule also applies to token and pair names. Do not widen `bet` to a word-start match — it would catch `beta`, `better`, `Bethany`.
- Tests: `hasBlockedName()` blocks `NewBet` and `newbet`, keeps `Beta` and `Better yield`; `isVaultIndexable()` through the vault adapter returns `false` for a NewBet vault; the vault sitemap integration test omits the `newbet` slug.
- After release, request removal in Search Console (Removals → Temporarily remove URL); a `noindex` page cannot be recrawled on request.
- The baseline and success criteria exclude `/vaults/newbet`.

## Workstream 1 — titles, H1s and descriptions of the hub pages

Code: `src/routes/vaults/+page.svelte`, `chains/[chain=slug]`, `protocols/[protocol=slug]`, `stablecoins/[denomination=slug]`, `curators/[curator=slug]` and the four group indexes (`chains`, `protocols`, `stablecoins`, `curators`). Titles go through `SocialCardMetaTags` (`titleParts` → `getPageTitle()`). The 60-character budget (`TITLE_MAX_LENGTH`) is a project rule, not a Google limit; `getPageTitle()` drops trailing parts to fit but never shortens the first one. So each title is **two parts** — the entity phrase and a qualifier — and a long chain, protocol or curator name loses the qualifier, not the brand:

| Page                                      | `titleParts`                                     | Rendered (suffix included, characters)                           | H1                  |
| ----------------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------- | ------------------- |
| `/vaults`                                 | `['Best DeFi vaults by APY and risk']`           | Best DeFi vaults by APY and risk \| Trading Strategy (51)        | Best DeFi vaults    |
| `/vaults/stablecoins`                     | `['Compare stablecoin yields']`                  | Compare stablecoin yields \| Trading Strategy (44)               | Stablecoin yields   |
| `/vaults/chains/<chain>`                  | `['<Chain> vaults', 'APY, TVL and risk']`        | Hyperliquid vaults \| APY, TVL and risk \| Trading Strategy (57) | `<Chain>` vaults    |
| `/vaults/protocols/<protocol>`            | `['<Protocol> vaults', 'APY, TVL and curators']` | Morpho vaults \| APY, TVL and curators \| Trading Strategy (56)  | `<Protocol>` vaults |
| `/vaults/stablecoins/<coin>`              | `['<SYMBOL> vaults', 'best <SYMBOL> yield']`     | USDC vaults \| best USDC yield \| Trading Strategy (48)          | `<SYMBOL>` vaults   |
| `/vaults/curators/<curator>`              | `['<Curator> vaults', 'APY, TVL and risk']`      | RE7 Labs vaults \| APY, TVL and risk \| Trading Strategy (54)    | `<Curator>` vaults  |
| `/vaults/protocols`, `chains`, `curators` | `['DeFi vaults by protocol']` etc.               | DeFi vaults by protocol \| Trading Strategy (42)                 | same                |

- Pools (`isPoolProtocolGroup`: GMX and Yield Basis) say "pools"; tokenised funds say "funds"; do not force "vaults" onto them.
- The chain hub's hero and description say which vaults it covers (for Hyperliquid: native vaults and HyperEVM), per the intent map.
- **Descriptions** are data-led and in search vocabulary, built only from figures that exist: "Compare 214 Morpho vaults by APY, TVL and risk: $1.2B TVL, 6.1 % average APY (TVL-weighted, 30 days). Data updated 25 Sep 2026." The loaders' `listingSummary` (`VaultListingSummary`, `src/lib/top-vaults/listing/types.ts:14`) has `matchingCount`, `totalTvl` and `avgTvlWeightedApy1M` only — no median, no top vault, no share by curator. Workstream 1 uses those three; anything more is workstream 3. The counts describe the **default filtered listing** (TVL and safety filters applied), and the copy says "listed", not "all". Where protocol, stablecoin or curator metadata has a `short_description`, append it after the data sentence rather than replacing it. The four group indexes load `VaultGroup[]`, not `listingSummary`; their descriptions use the group count and the summed TVL.
- Keep the hero subtitle as the place for our own definitions ("stablecoin-denominated", "TVL-weighted 3-month annualised return").
- Update `tests/integration/head-meta.test.ts` sample expectations and any `social-meta-tags`/hub tests that assert the old strings.

## Workstream 2 — vault detail titles

Code: `src/routes/vaults/[vault=slug]/SocialMetaTags.svelte` (`socialTitle`, `generatedDescription`, and the explicit Open Graph and Twitter title overrides passed to `SocialCardMetaTags`, which must change with it).

- Title: `titleParts` of `['<Name>', '<Protocol> vault on <Chain>']`, falling back to `'<Protocol> vault'`, then `'vault'`, as the qualifier when a part does not fit — a pure `getVaultPageTitle()` with unit tests, mirroring `getStrategyPageMeta()`. Use `pool` / `tokenised fund` from `getVaultAssetType()`. Skip the protocol when it is unknown.
- Description: the vault's own `vault.short_description` stays verbatim when present — the same decision `39ee8e1e` made for strategy pages (this is the vault's description from the dataset, not the curator's metadata). When absent, reword the generated one in search vocabulary with correctly labelled figures: "`<Name>` is a `<Protocol>` vault on `<Chain>`: APY 7.4 % (annualised, last 30 days), TVL $12.3M, risk: low." Use `getMonthlyReturn()` (annualised one-month, net if available) for APY — the current code uses `one_month_returns`, an absolute one-month return mislabelled as a monthly figure — and `getVaultCurrentTvlUsd()` for TVL, since `current_nav` is in denomination units. Omit either figure when unavailable.
- Appending a data sentence to a short vault description (under 70 characters) would lift CTR but contradicts `39ee8e1e`. Default: do not.

## Workstream 3 — useful, dated copy on the hubs

Titles alone will not move "morpho vaults" from unranked to page 1; the hubs are ~2,300 words of table and little else. Protocol hubs already show count, TVL and weighted return, and chain and coin hubs have generated description blocks, so more formula sentences would repeat those facts across hundreds of pages — the scaled-content pattern Google's spam policies target. The rule is usefulness, not a sentence count:

- One concise, page-specific answer to the searcher's question — which vaults lead and why — with a comparison or risk observation and a link to the vault that supports it. Omit a sentence when its data adds nothing on that page.
- This needs **new server-side aggregates over the full filtered population**, not the ≤ 75 rows the browser receives: top vaults by APY (with names and slugs), median APY, TVL share by curator/protocol. Define minimum-TVL and minimum-age rules so a new $10k vault with a spike cannot be "top APY", and a missing-value rule (skip the sentence).
- For the ~10 hubs with the most impressions (Hyperliquid, Morpho, Euler, Lighter, Midas, USDC, USDe, and the curators with impressions), one hand-written paragraph from protocol/curator metadata: what the vaults do, where the yield comes from, the main risks. Store it with the existing protocol/curator metadata, not in Svelte.
- Label the dataset date **"Data updated `<date>`"**, visibly and as `dateModified` in the hub's `CollectionPage` JSON-LD from the dataset's `generated_at`, so it does not imply an editorial update. (No sitemap `lastmod` — round 3 decision stands.)
- FAQ rich results are not shown for commercial sites; a Q&A block, if any, is for users and "explained"/"how does … work" queries, not for schema.

## Workstream 4 — protocol × stablecoin pages: query-backed pilot only

"morpho usdc vault", "spark usdc vault", "yearn usdc vault" and "morpho vaults usdc" are real Autocomplete phrases ("steakhouse usdc vault" is curator or single-vault intent, not protocol × coin). Generating a page for every combination with five or more vaults would be the doorway pattern — near-identical listings made for close query variations. Instead, at most two or three pilot pages, each only when all of these hold:

- demonstrated demand in Search Console or Autocomplete for that exact combination;
- a distinct vault set and comparison task that neither parent hub answers;
- original denomination-specific analysis on the page (workstream 3's rule);
- links from both parent hubs;
- a check after 4 weeks that Google keeps the pilot's own canonical and that it does not take queries from the parent hub.

Otherwise the combination stays a filter on the parent hub, canonicalised to the parent. Decide after PR 1's results.

## Workstream 5 — internal links to the hubs and between vaults

- Vault detail pages link to only 3–5 other vault URLs (protocol, chain, stablecoin hub). Add a server-rendered "Similar vaults" block: top 5 by TVL with the same protocol and denomination, excluding `noindex` vaults.
- Link the entity names in the detail page's "About" and "Curated by" sections to their hubs with descriptive anchors ("more Morpho vaults", "all RE7 Labs vaults"), not "View details".
- Glossary terms that rank (`hyperliquid-provider-vault`, `erc-7540`, `clmm` …) link to the matching hub. The glossary content lives in the docs repository; the frontend can add a "Related vaults" link on the term page.
- Blog: the posts with impressions link to the hubs they mention (editorial, in Ghost).

## Workstream 6 — measurement, before anything ships

`scripts/seo-search-console.mjs` can only list top pages or queries. Add, **before PR 1**, so the baseline is taken with the same tool as the result:

- `--start`/`--end`, `--page-regex` (a `dimensionFilterGroups` filter), `--country`, `--device` and `--dimensions query,page`.
- A `templates` command that groups pages by route pattern (vault detail, hubs by type, listings, tokens, glossary …) and prints clicks, impressions, CTR and impression-weighted position for two **equal-length** windows side by side.
- A `terms` command that reads a fixed category query set and a navigational query set from `scripts/seo-target-terms.json` and reports impressions, clicks and position **per query and per landing page**, plus Google-selected canonical for the landing pages (URL inspection).
- Report category and navigational results separately — a hub's average position can improve from more name-query impressions without any category gain. Query × page rows can be anonymised or truncated by Search Console, so reconcile them with page totals instead of presenting their sum as complete traffic.

Record the baseline and the results after 4 and 8 weeks in `docs/google-webmasters.md`.

## Workstream 7 — make `/vaults/stablecoins` the stablecoin yield comparison page

The intent map gives "stablecoin yields", "best stablecoin yield" and "stablecoin yield comparison" to `/vaults/stablecoins`. Turn that page into an evergreen comparison rather than a list of coins: for USDC, USDT, USDe and the other large stablecoins, the best current options with APY window, fees, liquidity or lockup and main risk, a dated methodology link, and links into the coin hubs and vaults. One maintained destination for the comparison intent instead of a URL per filter combination.

## Workstream 8 — HLP performance on the HLP vault page

~900 impressions over 90 days for "hlp vault apy", "hlp vault returns", "hlp vault performance" and similar. The intent map gives these to the HLP vault detail page. Add a section headed in those words ("HLP vault APY and returns") beside the existing data: historical return, drawdown, fees, calculation window and a short risk explanation. One substantive page for demonstrated demand.

## Workstream 9 — crawlable pagination for long hubs

Hubs render the first 75 rows server-side and load the rest in the browser, so vaults beyond the first batch get no contextual link from their protocol or coin hub. Keep the fast first batch, but add server-rendered page links to distinct, self-canonical paginated row sets (`?page=2` …) in the default sort only; sort and filter permutations stay canonicalised to the hub.

## Workstream 10 — data provenance and ranking policy

A short, linked "How we rank" block near every ranking and a methodology page it points to: data sources and coverage, refresh time, exclusions (blacklist, minimum TVL), how APY is calculated (window, net vs gross fallback) and how "best" is ordered. People comparing financial products need it to trust the table, and it is the original, first-hand explanation Google's helpful-content guidance asks for. Supersedes the "How we rank `<protocol>` vaults" item of the first draft.

## Workstream 11 — comparison tables and `ItemList` entries on the top hubs

- For Morpho, Hyperliquid and USDC: a small table above the full listing explaining _why_ the leading vaults differ (strategy, fee, liquidity, risk, return window), each row linking to the vault and the methodology. This answers "best … vaults" more directly than a table sorted by APY.
- Hub JSON-LD `ItemList` currently has only `numberOfItems`; add `itemListElement` with position, name and canonical URL for the server-rendered rows, in the same order as the visible table. Validate that values and order match the page. This helps Google read the collection; it carries no guaranteed rich result or ranking lift.

## Outside this repository

- Monthly blog post in the vocabulary above ("Best stablecoin yields — October 2026", "Best Hyperliquid vaults — …") generated from the same data, linking to the hubs. This is also the natural thing for others to link to; backlinks were ~775 total in the round 3 audit.
- Quarterly research snapshot (Morpho, Hyperliquid or stablecoin yields) with one original finding and a reproducible method, offered with charts or a data extract to researchers and industry publications — a reason to cite the site beyond hub links.
- Ask curators and protocols we list to link to their hub page (it ranks them and shows their vaults).

## Order

1. PR 0: workstream 6 (measurement) and the baseline in `docs/google-webmasters.md`.
2. PR 1: workstreams 0, 1 and 2 plus the unit/integration test updates. Small, measurable in 2–4 weeks.
3. PR 2: workstreams 5, 8 and 10.
4. PR 3: workstreams 3, 7 and 11 (aggregates first, hand-written paragraphs as they are written).
5. Workstream 9 when PR 2's link changes have been measured.
6. Decide the workstream 4 pilot after reading PR 1's effect.

## Success criteria (8 weeks after PR 1, measured with workstream 6)

Primary, per query and landing page from the fixed query sets:

- Category queries: at least 10 of the vocabulary phrases show impressions on their intent-map page, with clicks and position recorded per query; the intent-map page is the Google-selected canonical and the page Google shows for its query.
- Vault detail CTR from 1.25 % to 2 %, compared within the same position band (e.g. positions 5–10), not assuming position stays constant.
- Vault clicks per day from ~9 to 15 over an equal-length window, excluding `/vaults/newbet` (`noindex` after workstream 0).

Stretch:

- "hyperliquid vaults", "morpho vaults" and "defi vaults" on page 1–2 for their intent-map page.

## Guardrails

- No keyword stuffing: one primary phrase per title, H1 matches the title's entity phrase, copy reads as written for a person.
- Do not rename URLs; titles, headings and copy only (the pilot pages of workstream 4 are the exception).
- Every string change keeps `head-meta.test.ts` green (branded title, 70–155 character description, one canonical, one `og:image`).
- UK English in prose (`optimise`, `annualised`), but the search term "APY" stays as searched.
