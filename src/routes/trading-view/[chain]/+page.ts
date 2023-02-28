import type { PageLoad } from './$types';
import { fetchPublicApi } from '$lib/helpers/public-api';

// https://tradingstrategy.ai/api/explorer/#/default/web_chain_details
export const load = (async ({ params, fetch }) => {
	const chain_slug = params.chain;

	const chain = fetchPublicApi(fetch, 'chain-details', { chain_slug });
	const exchanges = fetchPublicApi(fetch, 'exchanges', { chain_slug, filter_zero_volume: 'true' }).then(
		(resp) => resp.exchanges // flatten the response
	);

	return {
		chain, // top-level promise is automatically awaited and unwrapped
		streamed: { exchanges } // second-level promise is streamed
	};
}) satisfies PageLoad;
