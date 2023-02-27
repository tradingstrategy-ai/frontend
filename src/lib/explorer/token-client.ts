import { fetchPublicApi } from '$lib/helpers/public-api';

type Fetch = typeof fetch;

export type TokenIndexParams = Partial<{
	chain_slug: string;
	page_size: number | string;
	page: number | string | null;
	sort: string;
	direction: 'asc' | 'desc';
}>;

type TokenSearchKey = keyof TokenIndexParams;

export type TokenIndexResponse = {
	rows: Record<string, any>[];
	totalRowCount: number;
};

const defaultParams: PairIndexParams = {
	page_size: 10,
	page: 0,
	sort: 'volume_24h',
	direction: 'desc'
};

const allKeys: TokenSearchKey[] = ['page_size', 'page', 'sort', 'direction', 'chain_slug'];

let controller: AbortController | null = null;

export async function fetchTokens(fetch: Fetch, params: TokenIndexParams) {
	// abort previous uncompleted request to prevent race condition
	controller?.abort();

	const apiParams: Record<string, string> = {};

	for (const key of allKeys) {
		const value = params[key] || defaultParams[key];
		if (value) apiParams[key] = String(value);
	}

	controller = new AbortController();
	const signal = controller.signal;
	let data;

	try {
		data = await fetchPublicApi(fetch, 'tokens', apiParams);
	} catch (e) {
		if (e.name !== 'AbortError') throw e;
	} finally {
		controller = null;
		if (signal.aborted) return;
	}

	return {
		rows: data.results,
		totalRowCount: data.total
	} as TokenIndexResponse;
}
