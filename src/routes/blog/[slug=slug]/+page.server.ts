import { error } from '@sveltejs/kit';
import { getPost, maxAge } from '$lib/blog/client';
import { transformPostHtml } from '$lib/blog/embeds';

export async function load({ fetch, params, setHeaders }) {
	const post = await getPost(fetch, params.slug).catch((e: { status?: number; message?: string }) => {
		// Ghost returns 404 for unknown slugs and 422 for malformed ones
		const status = e.status === 404 || e.status === 422 ? 404 : 503;
		error(status, e.message ?? 'Blog post unavailable');
	});

	setHeaders({
		'cache-control': `public, max-age=${maxAge}`
	});

	return { post: { ...post, html: transformPostHtml(post.html) } };
}
