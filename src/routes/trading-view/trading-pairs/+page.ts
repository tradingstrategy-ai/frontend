import { fetchPairs } from '$lib/explorer/pair-client';

export async function load({ fetch, url }) {
	const { searchParams } = url;
	const page = Number(searchParams.get('page')) || 0;
	const sort = searchParams.get('sort') || 'tvl';
	const direction = searchParams.get('direction') || 'desc';

	const pairs = await fetchPairs(fetch, { page, sort, direction });

	return {
		pairs,
		options: { page, sort, direction }
	};
}
