import { fetchPublicApi, optionalDataError } from '$lib/helpers/public-api';
import { getPosts } from '$lib/blog/client';

export async function load({ fetch, setHeaders, data }) {
	// Cache the landing page at Cloudflare edge for 30 minutes.
	// Vault data updates roughly hourly; 30 min is a good balance between
	// freshness and performance. See docs/cache-invalidation.md for purge instructions.
	setHeaders({
		'cache-control': 'public, max-age=1800' // 30 minutes: 30 * 60 = 1800
	});

	return {
		debugFreshness: data.debugFreshness,
		strategies: data.strategies,
		savingsRate: data.savingsRate,
		treasuryRate: data.treasuryRate,
		topVaults: data.topVaults,
		impressiveNumbers: await fetchPublicApi(fetch, 'impressive-numbers').catch(optionalDataError('impressive-numbers')),
		posts: await getPosts(fetch, { limit: 4 })
			.then((r) => r.posts)
			.catch(optionalDataError('blog posts'))
	};
}
