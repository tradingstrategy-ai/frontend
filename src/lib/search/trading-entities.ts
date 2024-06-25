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
	SearchParams,
	SearchResponseFacetCountSchema,
	SearchResponseHit
} from 'typesense/lib/Typesense/Documents';
import { type Writable, writable } from 'svelte/store';
import searchClient from './client';
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

// Allow filters to be array of strings rather than single string; see toTypesenseSearchParams
type CustomSearchParams = SearchParams & {
	filter_by?: string | string[];
};

const defaultSearchParams: CustomSearchParams = {
	query_by: ['description', 'token_tickers', 'token_names', 'smart_contract_addresses', 'internal_id'],
	sort_by: [],
	highlight_full_fields: 'description',
	highlight_start_tag: '<em>',
	highlight_end_tag: '</em>'
};

/**
 * Convert custom search params to standard Typesense search params and apply default values
 */
function toTypesenseSearchParams({ filter_by, ...searchParams }: CustomSearchParams): SearchParams {
	if (Array.isArray(filter_by)) {
		filter_by = filter_by.join(' && ');
	}

	return {
		...defaultSearchParams,
		...searchParams,
		filter_by
	};
}

const collection = searchClient?.collections<TradingEntityDocument>('trading-entities').documents();

export type TradingEntitiesStoreValue = {
	hits: TradingEntityHit[];
	facets: TradingEntityFacetCount[];
	count?: number;
	total?: number;
};

const { subscribe, set }: Writable<TradingEntitiesStoreValue> = writable({
	hits: [],
	facets: []
});

let lastSearchParams: CustomSearchParams | undefined = undefined;

async function search(searchParams: CustomSearchParams): Promise<void> {
	if (!collection) return;

	// dedup - don't re-run if same as last search
	if (dequal(searchParams, lastSearchParams)) {
		return;
	} else {
		lastSearchParams = searchParams;
	}

	try {
		const response = await collection.search(toTypesenseSearchParams(searchParams), {});

		// prevent race conditions - only update store if this was the last query
		if (dequal(searchParams, lastSearchParams)) {
			const hits = response.hits ?? response.grouped_hits?.flatMap(({ hits }) => hits as TradingEntityHit[]) ?? [];

			set({
				hits: hits as TradingEntityHit[],
				facets: response.facet_counts as TradingEntityFacetCount[],
				count: response.found,
				total: response.out_of
			});
		}
	} catch (error) {
		console.error(error);
	}
}

export default { subscribe, search };
