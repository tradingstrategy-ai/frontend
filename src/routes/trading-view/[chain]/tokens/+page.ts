import type { PageLoad } from './$types';
import { fetchTokens } from '$lib/explorer/token-client';

export const load = (async ({ fetch, params, url }) => {
	const { searchParams } = url;
	const page = Number(searchParams.get('page')) || 0;
	const sort = searchParams.get('sort') || 'volume_24h';
	const direction = searchParams.get('direction') || 'desc';

	const data = await fetchTokens(fetch, { chain_slug: params.chain, page, sort, direction });

	return { ...data, page, sort, direction };
}) satisfies PageLoad;
