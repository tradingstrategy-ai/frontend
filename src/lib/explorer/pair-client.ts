import { fetchPublicApi } from '$lib/helpers/public-api';
import { writable } from 'svelte/store';

type Fetch = typeof fetch;

export type PairIndexParams = Partial<{
	chain_slugs: string;
	exchange_slugs: string;
	token_addresses: string;
	page_size: number | string;
	page: number | string | null;
	sort: string;
	direction: 'asc' | 'desc';
}>;

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

const allKeys: PairSearchKey[] = [
	'page_size',
	'page',
	'sort',
	'direction',
	'chain_slugs',
	'exchange_slugs',
	'token_addresses'
];

let controller: AbortController | null = null;

export async function fetchPairs(fetch: Fetch, params: PairIndexParams) {
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
		data = await fetchPublicApi(fetch, 'pairs', apiParams);
	} catch (e) {
		if (e.name !== 'AbortError') throw e;
	} finally {
		controller = null;
		if (signal.aborted) return;
	}

	return {
		rows: data.results,
		totalRowCount: data.total
	} as PairIndexResponse;
}

export type PairIndexData = PairIndexResponse & {
	loading: boolean;
	error?: Error;
	page: number;
	sort: string;
	direction: PairIndexParams['direction'];
};

export function getPairsClient(fetch: Fetch) {
	const { subscribe, update } = writable({
		loading: false,
		rows: [],
		totalRowCount: 0,
		page: Number(defaultParams.page),
		sort: defaultParams.sort,
		direction: defaultParams.direction
	} as PairIndexData);

	function merge(data: Partial<PairIndexData>) {
		update((previous) => {
			delete previous.error;
			return { ...previous, ...data };
		});
	}

	async function updatePairs(params: PairIndexParams) {
		merge({
			loading: true,
			page: Number(params.page) || defaultParams.page,
			sort: params.sort || defaultParams.sort,
			direction: params.direction || defaultParams.direction
		});

		try {
			const data = await fetchPairs(fetch, params);
			if (data) merge({ ...data, loading: false });
		} catch (e) {
			merge({ error: <Error>e });
			console.log(e);
		}
	}

	return { subscribe, update: updatePairs };
}
