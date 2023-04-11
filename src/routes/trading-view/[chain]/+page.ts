import type { PageLoad } from './$types';
import { fetchPublicApi } from '$lib/helpers/public-api';

// https://tradingstrategy.ai/api/explorer/#/default/web_chain_details
export const load = (async ({ params, fetch }) => {
	const chain_slug = params.chain;

	const exchanges = fetchPublicApi(fetch, 'exchanges', { chain_slug, filter_zero_volume: 'true' }).then(
		(resp) => resp.exchanges // flatten the response
	);

	return { streamed: { exchanges } };
}) satisfies PageLoad;
