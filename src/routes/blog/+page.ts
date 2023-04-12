import fetchPosts from './fetchPosts';

export async function load() {
	return fetchPosts();
}
