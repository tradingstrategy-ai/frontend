import { fetchPairs } from '$lib/explorer/pair-client';
import { getNumberParam, getStringParam } from '$lib/helpers/url-params';
import { sortOptions } from '$lib/explorer/PairTable.svelte';

export async function load({ fetch, params, url }) {
	const { searchParams } = url;
	const page = getNumberParam(searchParams, 'page', 0);
	const sort = getStringParam(searchParams, 'sort', sortOptions.keys);
	const direction = getStringParam(searchParams, 'direction', sortOptions.directions);

	const pairs = await fetchPairs(fetch, {
		chain_slugs: params.chain,
		page,
		sort,
		direction
	});

	return {
		pairs,
		options: { page, sort, direction }
	};
}
