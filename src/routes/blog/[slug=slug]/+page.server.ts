import { getPost } from '$lib/blog/client';
import { error } from '@sveltejs/kit';

export async function load({ fetch, params, setHeaders }) {
	const post = await getPost(fetch, params.slug).catch((e: any) => {
		const status = [404, 422].includes(e.cause) ? 404 : 503;
		error(status, e.message);
	});

	setHeaders({
		'cache-control': 'public, max-age=1800' // 30 minutes: 30 * 60 = 1800
	});

	return { post };
}
