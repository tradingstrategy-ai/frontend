import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { fetchPublicApi } from '$lib/helpers/public-api';

export type PairIndexParams = Partial<{
	chain_slugs: string;
	exchange_slugs: string;
	token_addresses: string;
	page_size: number | string;
	page: MaybeNumber;
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
	sort: 'tvl',
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

export async function fetchPairs(fetch: Fetch, params: PairIndexParams) {
	const apiParams: Record<string, string> = {};

	for (const key of allKeys) {
		const value = params[key] || defaultParams[key];
		if (value) apiParams[key] = String(value);
	}

	const data = await fetchPublicApi(fetch, 'pairs', apiParams, true);

	if (!data) return;

	return {
		rows: data.results,
		totalRowCount: data.total
	} as PairIndexResponse;
}

export type PairIndexData = PairIndexResponse & {
	loading: boolean;
	error?: Error;
	page: MaybeNumber;
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
		// abort if called during SSR
		if (!browser) return;

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
