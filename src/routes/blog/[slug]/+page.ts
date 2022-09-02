import type { PageLoad } from './$types';
import ghostClient from '$lib/blog/client';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
	try {
		// See post data model: https://ghost.org/docs/content-api/#posts
		return await ghostClient.posts.read({ slug: params.slug }, { formats: ['html'] });
	} catch (e: any) {
		const status = e.response?.status || 500;
		if (status === 404 || status === 422) {
			throw error(404, `Blog post not found: ${params.slug}`);
		} else {
			throw error(status, e.message);
		}
	}
};
