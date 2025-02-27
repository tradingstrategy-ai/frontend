import { getPosts, maxAge } from '$lib/blog/client';

export async function load({ fetch, setHeaders }) {
	setHeaders({
		'cache-control': `public, max-age=${maxAge}`
	});

	return await getPosts(fetch, { limit: 40 });
}
