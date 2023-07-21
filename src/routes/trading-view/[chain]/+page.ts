import { fetchPublicApi } from '$lib/helpers/public-api';

export async function load({ params, fetch }) {
	const resp = fetchPublicApi(fetch, 'exchanges', {
		chain_slug: params.chain,
		sort: 'usd_volume_30d',
		direction: 'desc',
		filter_zero_volume: 'true'
	});

	// return the top 5
	const exchanges = resp.then((data) => data.exchanges.slice(0, 5));

	return { streamed: { exchanges } };
}
