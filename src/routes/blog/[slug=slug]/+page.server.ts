import { error } from '@sveltejs/kit';
import { getPost, maxAge } from '$lib/blog/client';

export async function load({ fetch, params, setHeaders }) {
	const post = await getPost(fetch, params.slug).catch((e: any) => {
		const status = [404, 422].includes(e.status) ? 404 : 503;
		error(status, e.message);
	});

	setHeaders({
		'cache-control': `public, max-age=${maxAge}`
	});

	return { post };
}
