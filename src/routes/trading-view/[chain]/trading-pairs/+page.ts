import { fetchPairs } from '$lib/explorer/pair-client';

export async function load({ fetch, params, url }) {
	const { searchParams } = url;
	const page = Number(searchParams.get('page')) || 0;
	const sort = searchParams.get('sort') || 'volume_30d';
	const direction = searchParams.get('direction') || 'desc';

	const pairs = await fetchPairs(fetch, {
		chain_slugs: params.chain,
		page,
		sort,
		direction
	});

	return {
		pairs,
		options: { page, sort, direction }
	};
}
