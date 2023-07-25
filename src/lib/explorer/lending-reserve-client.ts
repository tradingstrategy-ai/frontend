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

const defaultParams: LendingReserveIndexParams = {
	page_size: 10,
	page: 0,
	sort: 'variable_borrow_apr_latest',
	direction: 'asc'
};

const allKeys: LendingReserveSearchKey[] = ['page_size', 'page', 'sort', 'direction', 'protocol_slug', 'chain_slug'];

export async function fetchLendingReserves(fetch: Fetch, params: LendingReserveIndexParams) {
	const apiParams: Record<string, string> = {};

	for (const key of allKeys) {
		const value = params[key] || defaultParams[key];
		if (value) apiParams[key] = String(value);
	}

	let data;
	try {
		data = await fetchPublicApi(fetch, 'lending-reserves', apiParams, true);
	} catch (e) {
		// see: https://github.com/tradingstrategy-ai/backend/issues/188
		/* @ts-ignore */
		if (e?.status === 404) {
			data = { results: [], total: 0 };
		} else {
			throw e;
		}
	}

	if (!data) return;

	return {
		rows: data.results,
		totalRowCount: data.total
	} as LendingReserveIndexResponse;
}
