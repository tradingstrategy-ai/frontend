import type { PageLoad } from './$types';

export const load = (async ({ url }) => {
	const page = Number(url.searchParams.get('page')) || 1;
	await new Promise((resolve) => setTimeout(resolve, page * 2000));
	return { page };
}) satisfies PageLoad;
