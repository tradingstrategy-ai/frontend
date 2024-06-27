/**
 * This module exports a single default object: a svelte store for searching
 * the Typesense `trading-entities` collection.
 *
 * usage:
 *   tradingEntities.search({ q: "foo" }) // search the collection
 *   tradingEntities.subscribe(callback)  // receive updated search results
 *   $tradingEntities                     // within a component - Svelte's reactive store sugar
 */
import type {
	DocumentSchema,
	SearchResponseFacetCountSchema,
	SearchResponseHit
} from 'typesense/lib/Typesense/Documents';
import { writable } from 'svelte/store';
import { type CustomSearchParams, searchCollection } from './typesense-client';
import { dequal } from 'dequal';

// Trading Entitiy Document schemas; see:
// - https://github.com/tradingstrategy-ai/search/blob/main/schemas/trading-entities.json
// - https://github.com/tradingstrategy-ai/search/blob/main/docs/trading-entities.md
type BaseDocument = DocumentSchema & {
	id: string;
	internal_id: string;
	type_rank: number;
	name: string;
	description: string;
	blockchain: string;
	token_tickers: string[];
	token_names: string[];
	smart_contract_addresses: string[];
	url_path: string;
};

type ExchangeDocument = BaseDocument & {
	type: 'exchange';
	exchange: string;
	exchange_type: string;
};

type TradingPairDocument = BaseDocument & {
	type: 'pair';
	exchange: string;
	exchange_type: string;
	quality_factors: string[];
	volume_24h: number;
	liquidity: number;
	tvl: number;
	price_change_24h: number;
	price_usd_latest: number;
	pair_swap_fee: number;
};

type TokenDocument = BaseDocument & {
	type: 'token';
	volume_24h?: number;
	liquidity?: number;
	tvl?: number;
};

type LendingReserveDocument = BaseDocument & {
	type: 'lending_reserve';
	lending_protocol: string;
	supply_apr: number;
	stable_borrow_apr: number;
	variable_borrow_apr: number;
};

export type TradingEntityDocument = ExchangeDocument | TradingPairDocument | TokenDocument | LendingReserveDocument;
export type TradingEntityHit = SearchResponseHit<TradingEntityDocument>;
export type TradingEntityFacetCount = SearchResponseFacetCountSchema<TradingEntityDocument>;

const defaultSearchParams: CustomSearchParams = {
	query_by: ['description', 'token_tickers', 'token_names', 'smart_contract_addresses', 'internal_id'],
	sort_by: [],
	highlight_full_fields: 'description',
	highlight_start_tag: '<em>',
	highlight_end_tag: '</em>'
};

export type TradingEntitySearchResult = {
	loading: boolean;
	hits: TradingEntityHit[];
	facets: TradingEntityFacetCount[];
	count: number;
	total: number;
};

const emptyResult: TradingEntitySearchResult = {
	loading: false,
	hits: [],
	facets: [],
	count: 0,
	total: 0
};

const { subscribe, set, update } = writable(emptyResult);

let lastSearch: CustomSearchParams | undefined = undefined;

async function search(fetch: Fetch, searchParams: CustomSearchParams): Promise<void> {
	// Don't re-run query if search params match the last search
	if (dequal(searchParams, lastSearch)) return;
	lastSearch = searchParams;

	const mergedParams = { ...defaultSearchParams, ...searchParams };
	const hasSearch = Boolean(mergedParams.q || mergedParams.filter_by);
	const hasFacets = Boolean(mergedParams.facet_by?.length);

	// Set empty result if no search or facets
	if (!hasSearch && !hasFacets) {
		set(emptyResult);
		return;
	}

	// If only facets are requested, don't include any search hits
	if (hasFacets && !hasSearch) {
		mergedParams.per_page = 0;
	}

	// Mark as loading (but retain previous results)
	update((result) => ({ ...result, loading: true }));

	try {
		const response = await searchCollection<TradingEntityDocument>(fetch, 'trading-entities', mergedParams);
		if (!response) return;

		const hits = response.hits ?? response.grouped_hits?.flatMap(({ hits }) => hits) ?? [];

		set({
			loading: false,
			hits: hits,
			facets: response.facet_counts ?? [],
			count: response.found,
			total: response.out_of
		});
	} catch (err) {
		console.error(err);
	}
}

export default { subscribe, search };
