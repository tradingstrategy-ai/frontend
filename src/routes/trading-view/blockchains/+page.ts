import type { PageLoad } from './$types';
import { fetchPublicApi } from '$lib/helpers/public-api';

// https://tradingstrategy.ai/api/explorer/#/default/web_chain_details
export const load = (async ({ fetch }) => {
	return {
		chains: fetchPublicApi(fetch, 'chains')
	};
}) satisfies PageLoad;
