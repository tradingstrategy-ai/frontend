import { ghostConfig } from '$lib/config';
import { type RequestHandler, error } from '@sveltejs/kit';
import {
	type BlogPostDetails,
	type BlogPostIndex,
	type BlogPostIndexItem,
	blogPostResponseSchema,
	blogPostIndexSchema,
	blogPostIndexItemSchema
} from './schemas';

const { contentApiKey, apiUrl } = ghostConfig;

// number of seconds to cache blog responses (5 minutes)
export const maxAge = 300;

/**
 * Fetch a single blog post from Ghost API
 */
export async function getPost(fetch: Fetch, slug: string): Promise<BlogPostDetails> {
	if (!apiUrl || !contentApiKey) error(503, 'Ghost URL or API key not configured');

	const resp = await fetch(`${apiUrl}/ghost/api/content/posts/slug/${slug}/?key=${contentApiKey}`);

	if (!resp.ok) {
		error(resp.status, `Ghost API error: ${resp.statusText}`);
	}

	return blogPostResponseSchema.parse(await resp.json()).posts[0];
}

type BlogIndexParams = {
	limit?: number | string;
	page?: number | string;
};

/**
 * Fetch collection of blog posts using local proxy endpoint (see proxyPosts below)
 */
export async function getPosts(fetch: Fetch, params: BlogIndexParams): Promise<BlogPostIndex> {
	const searchParams = new URLSearchParams(params as Record<string, string>);

	const resp = await fetch(`/blog/posts?${searchParams}`);

	if (!resp.ok) {
		error(resp.status, `Blog posts API error: ${resp.statusText}`);
	}

	return blogPostIndexSchema.parse(await resp.json());
}

// Ghost's Content API caps the number of posts returned in a single response at
// 100, even when `limit=all` is requested. This is the maximum usable page size.
const maxPageSize = 100;

/**
 * Fetch every blog post across all pages.
 *
 * A single request cannot return more than 100 posts (Ghost silently caps
 * `limit=all` at 100), so this paginates using the maximum page size and follows
 * `meta.pagination.next` until exhausted. Use for consumers that must see the
 * complete set of posts, e.g. the sitemap.
 */
export async function getAllPosts(fetch: Fetch): Promise<BlogPostIndexItem[]> {
	const posts: BlogPostIndexItem[] = [];
	let page = 1;

	while (true) {
		const { posts: pagePosts, meta } = await getPosts(fetch, { limit: maxPageSize, page });
		posts.push(...pagePosts);

		const { next } = meta.pagination;
		// Stop when Ghost reports no further page. Guard against a malformed
		// response that never advances (or moves backwards) to avoid looping forever.
		if (next === null || next <= page) break;
		page = next;
	}

	return posts;
}

/**
 * A RequestHandler function for proxying blog post API responses from Ghost API
 *
 * - prevents CORS errors that were occurring only on Google's search crawler
 * - appends Ghost Content API key param
 * - appends fields param to limit the fields to those needed by post index consumers
 *
 * See: src/routes/blog/posts/+server.ts
 */
export const proxyPosts: RequestHandler = async function ({ fetch, url }) {
	if (!apiUrl || !contentApiKey) error(503, 'Ghost URL or API key not configured');

	const searchParams = new URLSearchParams(url.searchParams);

	// append Ghost Content API key
	searchParams.set('key', contentApiKey);

	// optimization: limit the fields returned
	const indexItemFields = Object.keys(blogPostIndexItemSchema.shape);
	searchParams.set('fields', indexItemFields.join(','));

	let resp: Response;

	try {
		resp = await fetch(`${apiUrl}/ghost/api/content/posts/?${searchParams}`);
	} catch (e) {
		error(500, 'Failed to connect to Ghost API');
	}

	if (!resp.ok) {
		error(resp.status, `Ghost API error: ${resp.statusText}`);
	}

	// Required headers
	const headers: Record<string, string> = {
		'cache-control': `public, max-age=${maxAge}`,
		'content-type': resp.headers.get('content-type') ?? 'application/json'
	};

	// Add optional headers if they exist
	for (const key of ['etag', 'vary']) {
		const value = resp.headers.get(key);
		if (value) headers[key] = value;
	}

	// Stream the response body directly, preserving status
	return new Response(resp.body, {
		status: resp.status,
		statusText: resp.statusText,
		headers
	});
};
