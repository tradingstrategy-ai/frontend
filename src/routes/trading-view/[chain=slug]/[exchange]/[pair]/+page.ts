import type { PairDetails } from '$lib/explorer/pair-client.js';
import { fetchPublicApi } from '$lib/helpers/public-api';
import { timeBucketEnum } from '$lib/schemas/utility.js';

export async function load({ fetch, params, setHeaders, url }) {
	const pair = await fetchPublicApi<PairDetails>(fetch, 'pair-details', {
		chain_slug: params.chain,
		exchange_slug: params.exchange,
		pair_slug: params.pair
	});

	const timeBucketParam = url.searchParams.get('timeBucket');
	const timeBucket = timeBucketEnum.catch('1d').parse(timeBucketParam);

	// Cache the pair data pages for 30 minutes at the Cloudflare edge so the
	// pages are served really fast if they get popular, and also for speed test.
	// stale-while-revalidate lets the edge serve a cached copy instantly (then
	// refresh in the background) for the long tail of rarely-hit pair URLs,
	// which avoids a cold SSR round-trip dominating mobile LCP.
	setHeaders({
		'cache-control': 'public, max-age=1800, stale-while-revalidate=86400' // 30 min fresh, 1 day stale
	});

	return {
		summary: pair.summary,
		details: pair.additional_details,
		timeBucket
	};
}
