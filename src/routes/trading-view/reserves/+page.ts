import type { PageLoad } from './$types';
import { fetchReserves } from '$lib/explorer/reserve-client';

export const load = (async ({ fetch, url }) => {
	const { searchParams } = url;
	const page = Number(searchParams.get('page')) || 0;
	const sort = searchParams.get('sort') || 'asset_name';
	const direction = searchParams.get('direction') || 'asc';

	return {
		reserves: fetchReserves(fetch, { page, sort, direction }),
		options: { page, sort, direction }
	};
}) satisfies PageLoad;
