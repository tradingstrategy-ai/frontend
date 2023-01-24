import ghostClient from '$lib/blog/client';

const limit = 6;

export default async function (page = { next: 4 }) {
	if (!page.next) return { page, posts: [] };
	const response = await ghostClient.posts?.browse({ limit, page: page.next });
	return {
		posts: [...response],
		page: response.meta.pagination
	};
}
