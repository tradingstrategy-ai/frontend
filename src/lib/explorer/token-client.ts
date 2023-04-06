import { fetchPublicApi } from '$lib/helpers/public-api';

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

const defaultParams: TokenIndexParams = {
	page_size: 10,
	page: 0,
	sort: 'volume_24h',
	direction: 'desc'
};

const allKeys: TokenSearchKey[] = ['page_size', 'page', 'sort', 'direction', 'chain_slug'];

export async function fetchTokens(fetch: Fetch, params: TokenIndexParams) {
	const apiParams: Record<string, string> = {};

	for (const key of allKeys) {
		const value = params[key] || defaultParams[key];
		if (value) apiParams[key] = String(value);
	}

	const data = await fetchPublicApi(fetch, 'tokens', apiParams, true);

	if (!data) return;

	return {
		rows: data.results,
		totalRowCount: data.total
	} as TokenIndexResponse;
}
