import type { PageLoad } from './$types';
import { fetchPublicApi } from '$lib/helpers/public-api';

export const load = (async ({ params, fetch }) => {
	const chain_slug = params.chain;
	const protocol_slug = params.protocol;
	const reserve_slug = params.reserve;

	return {
		reserve: fetchPublicApi(fetch, 'reserve/details', { chain_slug, protocol_slug, reserve_slug })
	};
}) satisfies PageLoad;
