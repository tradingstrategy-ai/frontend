import { fetchPublicApi } from '$lib/helpers/public-api';

export async function load({ params, fetch, setHeaders }) {
	// Cache the pair data pages for 30 minutes at the Cloudflare edge so the
	// pages are served really fast if they get popular, and also for speed test
	setHeaders({
		'cache-control': 'public, max-age=1800' // 30 minutes: 30 * 60 = 1800
	});

	return {
		pair: await fetchPublicApi(fetch, 'pair-details', {
			chain_slug: params.chain,
			exchange_slug: params.exchange,
			pair_slug: params.pair
		})
	};
}
