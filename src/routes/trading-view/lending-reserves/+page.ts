import { fetchLendingReserves } from '$lib/explorer/lending-reserve-client';

export async function load({ fetch, url }) {
	const { searchParams } = url;
	const page = Number(searchParams.get('page')) || 0;
	const sort = searchParams.get('sort') || 'asset_name';
	const direction = searchParams.get('direction') || 'asc';

	const reserves = fetchLendingReserves(fetch, { page, sort, direction }).catch((e) => {
		console.error('Error fetching lending reserves:', e);
	});

	return {
		reserves,
		options: { page, sort, direction }
	};
}
