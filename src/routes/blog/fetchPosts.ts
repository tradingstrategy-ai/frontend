import ghostClient from '$lib/blog/client';

const limit = 40;

// next argument indicates which page to fetch; defaults to 1 for first page
export default async function (page = { next: 1 }) {
	if (!page.next) return { page, posts: [] };
	const response = await ghostClient.posts?.browse({ limit, page: page.next });
	return {
		posts: [...response],
		page: response.meta.pagination
	};
}
