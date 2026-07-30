# Search

## Overview

The site-wide vault search is implemented in SvelteKit and searches the vault JSON data already used by the frontend.

Search is available from the desktop navigation, the compact mobile navigation and the server-rendered [`/search`](/search) page. The full results page is a normal GET form, so links such as `/search?q=USDC` work without client-side JavaScript.

## Searchable entities and results

The server-only index in `src/lib/search/vault-search.server.ts` creates records for:

- vaults, including case-insensitive contract-address matching;
- curators;
- protocols;
- stablecoins; and
- chains.

Blacklisted vaults remain findable but are shown as the distinct **Blacklisted vault** type, with a struck-through name. They sort after non-blacklisted matches. Vault names show the first eight hexadecimal digits of the address after `0x`.

Every result provides a name, entity type, one-month APY, latest TVL, canonical destination and logo URL. Aggregate entity metrics use eligible, non-blacklisted vaults and USD-normalised TVL. One-month APY is TVL-weighted and excludes invalid or extreme values through the same helper used by vault listings.

Results sort by relevance first, then latest TVL descending and name ascending. The full results table starts sorted by latest TVL, with blacklisted vaults still placed last. The typeahead diversifies the initial suggestions by entity type before filling any remaining positions.
The results page returns at most 100 rows and explicitly reports when a broader query has been truncated.

## Typeahead

`src/lib/search/components/Search.svelte` sends a request to `/search/suggestions` after a 200 ms debounce. It cancels the preceding request and ignores stale responses. The endpoint caps requests at 20 results (the widget asks for 10) and queries at 100 characters.

Keyboard navigation follows the combobox pattern: Arrow keys choose a suggestion, Enter opens the selected result or submits the query, and Escape closes the quick search. On mobile, the widget opens as a full-height dialog and restores focus to its trigger when closed. The dialog is layered above page content and only the mobile dialog locks body scrolling.
On desktop, interacting outside the search closes the quick-results panel.

Desktop vault suggestions and full results show the 90-day price mini-map when chart data is available. Aggregate entities do not show a mini-map.

## Data and caching

The index combines `getCachedTopVaults()` with stablecoin metadata. It is held in server memory for two minutes and is rebuilt early when the vault dataset's `generated_at` value changes. The suggestions response is publicly cacheable for 60 seconds.

The browser receives only public `SearchResult` fields. Matching aliases and normalised search terms remain server-side.

## SEO

The bare `/search` page is included in the static sitemap and `robots.txt` advertises the sitemap. Query-result URLs include `noindex,follow` and use `/search` as their canonical URL, preventing arbitrary query pages from competing in search results while allowing the search page itself to be discovered.

The home page retains WebSite `SearchAction` structured data pointing to `/search?q={search_term_string}`. Google no longer presents a visual sitelinks search box from this markup, but the query URL remains accurate structured-data metadata.

## Tests

`tests/integration/search.test.ts` covers desktop and mobile typeahead, the mobile navigation drawer, the result page, address lookup, blacklisted vault treatment, sortable entity types, desktop-only mini-maps, and all supported entity types. Vault-listing integration tests confirm the old in-listing search control remains absent.

Use:

```shell
pnpm exec playwright test --config tests/integration/playwright.config.ts tests/integration/search.test.ts
```
