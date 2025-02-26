import { getPosts } from '$lib/blog/client';

export async function load({ fetch }) {
	return await getPosts(fetch, { limit: 40 });
}
