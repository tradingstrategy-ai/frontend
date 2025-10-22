import { fetchPublicApi, optionalDataError } from '$lib/helpers/public-api';
import { getPosts } from '$lib/blog/client';

export async function load({ fetch, setHeaders, data }) {
	// Cache the landing data for 5 minutes at the Cloudflare so pages are
	// served really fast if they get popular, and also for speed test
	setHeaders({
		'cache-control': 'public, max-age=300' // 5 minutes: 5 * 60 = 300
	});

	return {
		strategies: data.strategies,
		chains: await fetchPublicApi(fetch, 'chains').catch(optionalDataError('chains')),
		impressiveNumbers: await fetchPublicApi(fetch, 'impressive-numbers').catch(optionalDataError('impressive-numbers')),
		posts: await getPosts(fetch, { limit: 4 })
			.then((r) => r.posts)
			.catch(optionalDataError('blog posts'))
	};
}
