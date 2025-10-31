import { fetchTokens } from '$lib/explorer/token-client';
import { getNumberParam, getStringParam } from '$lib/helpers/url-params';
import { sortOptions } from '$lib/explorer/TokenTable.svelte';

export async function load({ fetch, params, url }) {
	const { searchParams } = url;
	const page = getNumberParam(searchParams, 'page', 0);
	const sort = getStringParam(searchParams, 'sort', sortOptions.keys);
	const direction = getStringParam(searchParams, 'direction', sortOptions.directions);

	const data = await fetchTokens(fetch, { chain_slug: params.chain, page, sort, direction });

	return {
		tokens: { ...data, page, sort, direction }
	};
}
