import { fetchPairs } from '$lib/explorer/pair-client';

export async function load({ fetch, url }) {
	const { searchParams } = url;
	const page = Number(searchParams.get('page')) || 0;
	const sort = searchParams.get('sort') || 'volume_30d';
	const direction = searchParams.get('direction') || 'desc';

	const data = await fetchPairs(fetch, { page, sort, direction });

	return { ...data, page, sort, direction };
}
