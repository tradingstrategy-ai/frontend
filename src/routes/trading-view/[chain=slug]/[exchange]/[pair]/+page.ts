import { fetchPublicApi } from '$lib/helpers/public-api';
import { timeBucketEnum } from '$lib/schemas/utility.js';

export async function load({ fetch, params, setHeaders, url }) {
	const pair = await fetchPublicApi(fetch, 'pair-details', {
		chain_slug: params.chain,
		exchange_slug: params.exchange,
		pair_slug: params.pair
	});

	const timeBucketParam = url.searchParams.get('timeBucket');
	const timeBucket = timeBucketEnum.catch('1d').parse(timeBucketParam);

	// Cache the pair data pages for 30 minutes at the Cloudflare edge so the
	// pages are served really fast if they get popular, and also for speed test
	setHeaders({
		'cache-control': 'public, max-age=1800' // 30 minutes: 30 * 60 = 1800
	});

	return {
		summary: pair.summary,
		details: pair.additional_details,
		timeBucket
	};
}
