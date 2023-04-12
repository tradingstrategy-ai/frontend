import { fetchPublicApi } from '$lib/helpers/public-api';

export async function load({ params, fetch }) {
	const chain_slug = params.chain;
	const protocol_slug = params.protocol;
	const reserve_slug = params.reserve;

	return {
		reserve: fetchPublicApi(fetch, 'reserve/details', { chain_slug, protocol_slug, reserve_slug })
	};
}
