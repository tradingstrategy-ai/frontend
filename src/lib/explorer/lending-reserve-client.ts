import { fetchPublicApi } from '$lib/helpers/public-api';

export type LendingReserveIndexParams = Partial<{
	protocol_slug: string;
	chain_slug: string;
	page_size: number | string;
	page: number | string | null;
	sort: string;
	direction: 'asc' | 'desc';
}>;

type LendingReserveSearchKey = keyof LendingReserveIndexParams;

export type LendingReserveIndexResponse = {
	rows: Record<string, any>[];
	totalRowCount: number;
};

/**
 * NOTE: hard-coding aave_v3 for now since `protocol_slug` is required by `reserves`
 * endpoint and this is the only protocol currently supported
 */
const defaultParams: LendingReserveIndexParams = {
	protocol_slug: 'aave_v3',
	page_size: 10,
	page: 0,
	sort: 'asset_name',
	direction: 'asc'
};

const allKeys: LendingReserveSearchKey[] = ['page_size', 'page', 'sort', 'direction', 'protocol_slug', 'chain_slug'];

export async function fetchLendingReserves(fetch: Fetch, params: LendingReserveIndexParams) {
	const apiParams: Record<string, string> = {};

	for (const key of allKeys) {
		const value = params[key] || defaultParams[key];
		if (value) apiParams[key] = String(value);
	}

	const data = await fetchPublicApi(fetch, 'lending-reserves', apiParams, true);

	if (!data) return;

	return {
		rows: data.results,
		totalRowCount: data.total
	} as LendingReserveIndexResponse;
}
