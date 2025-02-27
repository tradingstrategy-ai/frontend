import type { RequestHandler } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import { ghostConfig } from '$lib/config';
import { type BlogPost, type BlogPostIndex, blogPostsSchema, blogPostIndexSchema } from '$lib/schemas/blog';

const { contentApiKey, apiUrl } = ghostConfig;

const directPostsUrl = `${apiUrl}/ghost/api/content/posts/`;
const proxyPostsUrl = '/blog';

// number of seconds to cache blog responses (5 minutes)
export const maxAge = 300;

/**
 * Fetch a single blog post from Ghost API
 */
export async function getPost(fetch: Fetch, slug: string): Promise<BlogPost> {
	const resp = await fetch(`${apiUrl}/ghost/api/content/posts/slug/${slug}/?key=${contentApiKey}`);

	if (!resp.ok) {
		throw new Error(resp.statusText, { cause: resp.status });
	}

	const data = await resp.json();
	return blogPostsSchema.parse(data).posts[0];
}

/**
 * Get search params for appending to URL, optionally including the Ghost API key
 */
function getSearchParams(params: URLSearchParams | Record<string, string | number>, includeApiKey = false) {
	const searchParams = new URLSearchParams(params as Record<string, string>);
	if (includeApiKey) {
		searchParams.set('key', contentApiKey);
	}
	return searchParams;
}

type BlogIndexParams = {
	limit?: number | string | 'all';
	page?: number | string;
};

/**
 * Fetch collection of blog posts, optionally using a local proxy endpoint (see proxyPosts below)
 */
export async function getPosts(fetch: Fetch, params: BlogIndexParams, proxy = false): Promise<BlogPostIndex> {
	const searchParams = getSearchParams(params as Record<string, string>, !proxy);

	const url = proxy ? proxyPostsUrl : directPostsUrl;
	const resp = await fetch(`${url}?${searchParams}`);

	if (!resp.ok) {
		throw new Error(resp.statusText, { cause: resp.status });
	}

	const data = await resp.json();
	return blogPostIndexSchema.parse(data);
}

/**
 * A RequestHandler function for proxying blog post API responses from Ghost API
 *
 * Used to prevent CORS errors that were occurring on Google's search crawler
 *
 * See: src/routes/blog/+server.ts
 */
export const proxyPosts: RequestHandler = async function ({ fetch, setHeaders, url }) {
	const searchParams = getSearchParams(url.searchParams, true);

	let resp: Response;

	try {
		resp = await fetch(`${directPostsUrl}?${searchParams}`);
	} catch (e) {
		throw error(500, 'Failed to connect to Ghost API');
	}

	if (!resp.ok) {
		throw error(resp.status, `Ghost API error: ${resp.statusText}`);
	}

	// Required headers
	const headers: Record<string, string> = {
		'cache-control': `public, max-age=${maxAge}`,
		'content-type': resp.headers.get('content-type') ?? 'application/json'
	};

	// Add optional headers if they exist
	['etag', 'vary'].forEach((key) => {
		const value = resp.headers.get(key);
		if (value) headers[key] = value;
	});

	setHeaders(headers);

	// Stream the response body directly, preserving status
	return new Response(resp.body, {
		status: resp.status,
		statusText: resp.statusText
	});
};
