import type { PageLoad } from './$types';
import { fetchPublicApi } from '$lib/helpers/public-api';

// https://tradingstrategy.ai/api/explorer/#/default/web_chain_details
export const load = (async ({ params, fetch }) => {
	return fetchPublicApi(fetch, 'chain-details', { chain_slug: params.chain });
}) satisfies PageLoad;
