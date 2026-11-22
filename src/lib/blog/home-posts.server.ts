import { createWarmCache } from '$lib/server/warm-cache';
import { getPosts } from './client';

/** Number of posts in the home page's blog roll. */
export const HOME_PAGE_POST_COUNT = 4;

/**
 * The latest posts for the home page blog roll. Refreshed every 20 minutes by the background
 * warmer, so a home page render never waits for Ghost.
 */
export const homePostsCache = createWarmCache({
	name: 'home-blog-posts',
	load: async (_key, fetch) => (await getPosts(fetch, { limit: HOME_PAGE_POST_COUNT })).posts,
	refreshIntervalMs: 20 * 60 * 1000
});
