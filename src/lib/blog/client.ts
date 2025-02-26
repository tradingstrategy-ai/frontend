import { ghostConfig } from '$lib/config';
import { type BlogPost, blogPostsSchema } from '$lib/schemas/blog';

// deprecated
import GhostContentAPI from '@tryghost/content-api';
export default (({ apiUrl, contentApiKey }) => {
	if (!apiUrl || !contentApiKey) return;

	return new GhostContentAPI({
		url: apiUrl,
		key: contentApiKey,
		version: 'v5.0'
	});
})(ghostConfig);

const { contentApiKey, apiUrl } = ghostConfig;

export async function getPost(fetch: Fetch, slug: string): Promise<BlogPost> {
	const resp = await fetch(`${apiUrl}/ghost/api/content/posts/slug/${slug}?key=${contentApiKey}`);

	if (!resp.ok) {
		throw new Error(resp.statusText, { cause: resp.status });
	}

	const data = await resp.json();
	return blogPostsSchema.parse(data).posts[0];
}
