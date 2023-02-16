import { backendUrl } from '$lib/config';
import { publicApiError } from '$lib/helpers/publicApiError';

type Fetch = typeof fetch;

export type PairIndexParams = {
	chain_slugs?: string;
	token_addresses?: string;
	page_size?: number | string;
	page?: number | string | null;
	sort?: string;
	direction?: 'asc' | 'desc';
};

type PairSearchKey = keyof PairIndexParams;

export type PairIndexResponse = {
	rows: Record<string, any>[];
	totalRowCount: number;
	page: number;
	sort: string;
	direction: 'asc' | 'desc';
};

const defaultParams: PairIndexParams = {
	page_size: 10,
	page: 0,
	sort: 'volume_30d',
	direction: 'desc'
};

const allKeys: PairSearchKey[] = ['page_size', 'page', 'sort', 'direction', 'chain_slugs', 'token_addresses'];

// https://tradingstrategy.ai/api/explorer/#/Trading%20pair/web_pairs
const apiUrl = `${backendUrl}/pairs`;

export async function fetchPairs(fetch: Fetch, params: PairIndexParams) {
	const apiParams = new URLSearchParams();

	for (const key of allKeys) {
		const value = params[key] || defaultParams[key];
		value && apiParams.set(key, String(value));
	}

	const resp = await fetch(`${apiUrl}?${apiParams}`);

	if (!resp.ok) {
		throw await publicApiError(resp);
	}

	const data = await resp.json();

	return {
		rows: data.results,
		totalRowCount: data.total,
		page: Number(apiParams.get('page')),
		sort: apiParams.get('sort'),
		direction: apiParams.get('direction')
	} as PairIndexResponse;
}
