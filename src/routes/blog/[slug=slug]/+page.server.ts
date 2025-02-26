import ghostClient from '$lib/blog/client';
import { error } from '@sveltejs/kit';

export async function load({ params, setHeaders }) {
	// See post data model: https://ghost.org/docs/content-api/#posts
	const post = await ghostClient.posts.read({ slug: params.slug }, { formats: ['html'] }).catch((e: any) => {
		const status = [404, 422].includes(e.response?.status) ? 404 : 503;
		error(status, e.message);
	});

	setHeaders({
		'cache-control': 'public, max-age=1800' // 30 minutes: 30 * 60 = 1800
	});

	return { post };
}
