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
};

const defaultParams: PairIndexParams = {
	page_size: 10,
	page: 0,
	sort: 'volume_30d',
	direction: 'desc'
};

const allKeys: PairSearchKey[] = ['page_size', 'page', 'sort', 'direction', 'chain_slugs', 'token_addresses'];

let controller: AbortController | null = null;

export async function fetchPairs(fetch: Fetch, params: PairIndexParams) {
	// abort previous uncompleted request to prevent race condition
	controller?.abort();

	const apiParams = new URLSearchParams();

	for (const key of allKeys) {
		const value = params[key] || defaultParams[key];
		value && apiParams.set(key, String(value));
	}

	controller = new AbortController();
	const signal = controller.signal;
	let resp: Response;

	try {
		resp = await fetch(`${backendUrl}/pairs?${apiParams}`);
		if (!resp.ok) throw await publicApiError(resp);
	} catch (e) {
		if (e.name !== 'AbortError') throw e;
	} finally {
		controller = null;
		if (signal.aborted) return;
	}

	const data = await resp.json();

	return {
		rows: data.results,
		totalRowCount: data.total
	} as PairIndexResponse;
}
