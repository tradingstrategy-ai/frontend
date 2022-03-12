/**
 * This module exports a single default object: a svelte store for searching
 * the Typesense `trading-entities` collection.
 *
 * usage:
 *   tradingEntities.search({ q: "foo" }) // search the collection
 *   tradingEntities.subscribe(callback)  // receive updated search results
 *   $tradingEntities                     // within a component - Svelte's reactive store sugar
 */
import { writable } from "svelte/store";
import searchClient from "./client";

const defaultOptions = {
  query_by: ["description", "token_tickers", "token_names", "smart_contract_addresses"],
  sort_by: [],
  highlight_full_fields: "description",
  highlight_start_tag: "<em>",
  highlight_end_tag: "</em>"
};

const collection = searchClient?.collections("trading-entities").documents();

const { subscribe, set } = writable({
  hits: [],
  facets: [],
  count: null,
  total: null
});

let lastSearchJSON;

interface SearchOptions {
  q: string;
  facet_by?: Array<string>;
  filter_by?: Array<string>;
  group_by?: Array<string>;
  sort_by?: Array<string>;
  per_page?: number;
}

function typesenseOptions(options: SearchOptions) {
  const mergedOptions = {...defaultOptions, ...options };
  for (const key in mergedOptions) {
    if (key === "filter_by") {
      mergedOptions[key] = mergedOptions[key].join(" && ");
    } else if (mergedOptions[key] instanceof Array) {
      mergedOptions[key] = mergedOptions[key].toString();
    }
  }
  return mergedOptions;
}

async function search(options: SearchOptions): Promise<void> {
  if (!collection) return;

  const searchJSON = JSON.stringify(options);
  if (searchJSON === lastSearchJSON) {
    return;
  } else {
    lastSearchJSON = searchJSON;
  }

  try {
    const response = await collection.search(typesenseOptions(options), {});
    // prevent race conditions - only update store if this was the last query
    if (searchJSON === lastSearchJSON) {
      const hits = response.hits || response.grouped_hits.flatMap((group) => group.hits);
      set({
        hits,
        facets: response.facet_counts,
        count: response.found,
        total: response.out_of
      });
    }
  } catch (error) {
    console.error(error);
  }
}

export default { subscribe, search };
