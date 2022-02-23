import { writable } from "svelte/store";
import searchClient from "./client";

const searchOptions = {
  query_by: "name,token_tickers,token_names,smart_contract_addresses",
  sort_by: "type_rank:asc,_text_match:desc,volume_24h:desc",
  group_by: "type"
};

const { subscribe, set } = writable([]);
let collection;

if (searchClient) {
  collection = searchClient.collections("trading-entities").documents();
}

async function search(query) {
  const q = query.trim();

  if (!(collection && q)) {
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
