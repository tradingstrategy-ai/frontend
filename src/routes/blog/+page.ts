import type { PageLoad } from './$types';
import fetchPosts from './fetchPosts';

export const load = (() => {
	return fetchPosts();
}) satisfies PageLoad;
