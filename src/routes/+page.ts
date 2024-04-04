import { fetchPublicApi } from '$lib/helpers/public-api';
import ghostClient from '$lib/blog/client';

// handle API fetch errors gracefully (see `catch` below)
function logError(err: Error) {
	console.error('Request failed; rendering page without data.');
	console.error(err);
}

export async function load({ fetch, setHeaders, data }) {
	// Cache the landing data for 5 minutes at the Cloudflare so pages are
	// served really fast if they get popular, and also for speed test
	setHeaders({
		'cache-control': 'public, max-age=300' // 5 minutes: 5 * 60 = 300
	});

	return {
		strategies: data.strategies,
		topMomentum: await fetchPublicApi(fetch, 'top-momentum', { summary: 'true' }).catch(logError),
		impressiveNumbers: await fetchPublicApi(fetch, 'impressive-numbers').catch(logError),
		posts: await ghostClient.posts?.browse({ limit: 4 }).catch(logError)
	};
}
