import { getAllPosts, maxAge } from '$lib/blog/client';

/** Load every podcast episode for the unpaginated podcast index. */
export async function load({ fetch, setHeaders }) {
	setHeaders({
		'cache-control': `public, max-age=${maxAge}`
	});

	const posts = await getAllPosts(fetch);

	return {
		// The first four episodes used "Podcast #" before the series switched to "Episode #".
		posts: posts.filter(({ title }) => /\b(?:episode|podcast)\s*#\d+\b/i.test(title))
	};
}
