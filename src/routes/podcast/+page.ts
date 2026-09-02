import { getAllPosts, maxAge } from '$lib/blog/client';

export async function load({ fetch, setHeaders }) {
	setHeaders({
		'cache-control': `public, max-age=${maxAge}`
	});

	const posts = await getAllPosts(fetch);

	return {
		posts: posts.filter(({ title }) => title.toLowerCase().includes('episode'))
	};
}
