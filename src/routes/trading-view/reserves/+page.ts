import type { PageLoad } from './$types';
import { fetchReserves } from '$lib/explorer/reserve-client';

export const load = (async ({ fetch, url }) => {
	const { searchParams } = url;
	const page = Number(searchParams.get('page')) || 0;
	const sort = searchParams.get('sort') || 'asset_name';
	const direction = searchParams.get('direction') || 'asc';

	const data = await fetchReserves(fetch, { page, sort, direction });

	return { ...data, page, sort, direction };
}) satisfies PageLoad;
