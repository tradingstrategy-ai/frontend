import { fetchPublicApi } from '$lib/helpers/public-api';

export async function load({ params, fetch }) {
	const direction = params.direction.split('-')[1] as 'up' | 'down';

	const data = await fetchPublicApi(fetch, 'top-momentum');

	return {
		direction,
		pairs: data[`top_${direction}_24h_min_liq_1m`]
	};
}
