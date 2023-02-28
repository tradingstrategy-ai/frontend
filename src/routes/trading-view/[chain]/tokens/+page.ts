import type { PageLoad } from '../$types';
import { fetchTokens } from '$lib/explorer/token-client';

export const load = (async ({ fetch, params, url }) => {
	const { searchParams } = url;

	const apiParams = {
		page: Number(searchParams.get('page')) || 0,
		sort: searchParams.get('sort') || 'volume_24h',
		direction: searchParams.get('direction') || 'desc'
	};

	const data = await fetchTokens(fetch, { chain_slug: params.chain, ...apiParams });

	return { ...data, ...apiParams };
}) satisfies PageLoad;
