import { ghostConfig } from '$lib/config';
import { type BlogPost, type BlogPostIndex, blogPostsSchema, blogPostIndexSchema } from '$lib/schemas/blog';

const { contentApiKey, apiUrl } = ghostConfig;

export async function getPost(fetch: Fetch, slug: string): Promise<BlogPost> {
	const resp = await fetch(`${apiUrl}/ghost/api/content/posts/slug/${slug}/?key=${contentApiKey}`);

	if (!resp.ok) {
		throw new Error(resp.statusText, { cause: resp.status });
	}

	const data = await resp.json();
	return blogPostsSchema.parse(data).posts[0];
}

type BlogIndexParams = {
	limit?: number | 'all';
	page?: number;
};

export async function getPosts(fetch: Fetch, params: BlogIndexParams): Promise<BlogPostIndex> {
	const searchParams = new URLSearchParams(params as Record<string, string>);
	searchParams.append('key', contentApiKey);

	const resp = await fetch(`${apiUrl}/ghost/api/content/posts/?${searchParams}`);

	if (!resp.ok) {
		throw new Error(resp.statusText, { cause: resp.status });
	}

	const data = await resp.json();
	return blogPostIndexSchema.parse(data);
}
