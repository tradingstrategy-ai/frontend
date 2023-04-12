import ghostClient from '$lib/blog/client';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
	// See post data model: https://ghost.org/docs/content-api/#posts
	const post = ghostClient.posts.read({ slug: params.slug }, { formats: ['html'] }).catch((e: any) => {
		const status = [404, 422].includes(e.response?.status) ? 404 : 503;
		throw error(status, e.message);
	});

	return { post };
}
