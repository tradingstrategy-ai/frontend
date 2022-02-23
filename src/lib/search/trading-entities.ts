/**
 * This module exports a single default object: a svelte store for searching
 * the Typesense `trading-entities` collection.
 *
 * usage:
 *   tradingEntities.search('foo')        // search the collection
 *   tradingEntities.subscribe(callback)  // receive updated search results
 *   $tradingEntities                     // within a component - Svelte's reactive store sugar
 */
import { writable } from "svelte/store";
import searchClient from "./client";

const searchOptions = {
  query_by: "name,token_tickers,token_names,smart_contract_addresses",
  sort_by: "type_rank:asc,_text_match:desc,volume_24h:desc",
  group_by: "type"
};

const collection = searchClient?.collections("trading-entities").documents();

const { subscribe, set } = writable([]);

async function search(query: string): Promise<void> {
  if (!collection) return;

  const q = query.trim();

  if (q === "") {
    set([]);
    return;
  }

  try {
    const response = await collection.search({ q, ...searchOptions });
    set(response.grouped_hits.flatMap((group) => group.hits));
  } catch (error) {
    console.error(error);
  }
}

export default { subscribe, search };
