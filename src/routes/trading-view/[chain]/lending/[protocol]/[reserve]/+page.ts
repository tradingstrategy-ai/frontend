import { fetchPublicApi } from '$lib/helpers/public-api';

export async function load({ params, fetch }) {
	return {
		reserve: fetchPublicApi(fetch, 'lending-reserve/details', {
			chain_slug: params.chain,
			protocol_slug: params.protocol,
			reserve_slug: params.reserve
		})
	};
}
