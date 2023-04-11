import { fetchPublicApi } from '$lib/helpers/public-api';

export type ReserveIndexParams = Partial<{
	protocol_slug: string;
	chain_slug: string;
	page_size: number | string;
	page: number | string | null;
	sort: string;
	direction: 'asc' | 'desc';
}>;

type ReserveSearchKey = keyof ReserveIndexParams;

export type ReserveIndexResponse = {
	rows: Record<string, any>[];
	totalRowCount: number;
};

/**
 * NOTE: hard-coding aave_v3 for now since `protocol_slug` is required by `reserves`
 * endpoint and this is the only protocol currently supported
 */
const defaultParams: ReserveIndexParams = {
	protocol_slug: 'aave_v3',
	page_size: 10,
	page: 0,
	sort: 'asset_name',
	direction: 'asc'
};

const allKeys: ReserveSearchKey[] = ['page_size', 'page', 'sort', 'direction', 'protocol_slug', 'chain_slug'];

export async function fetchReserves(fetch: Fetch, params: ReserveIndexParams) {
	const apiParams: Record<string, string> = {};

	for (const key of allKeys) {
		const value = params[key] || defaultParams[key];
		if (value) apiParams[key] = String(value);
	}

	const data = await fetchPublicApi(fetch, 'reserves', apiParams, true);

	if (!data) return;

	return {
		rows: data.results,
		totalRowCount: data.total
	} as ReserveIndexResponse;
}
