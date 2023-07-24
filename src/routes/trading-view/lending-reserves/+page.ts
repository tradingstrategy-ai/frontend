import { fetchLendingReserves } from '$lib/explorer/lending-reserve-client';

export async function load({ fetch, url }) {
	const { searchParams } = url;
	const page = Number(searchParams.get('page')) || 0;
	const sort = searchParams.get('sort') || 'variable_borrow_apr_latest';
	const direction = searchParams.get('direction') || 'asc';

	const reserves = fetchLendingReserves(fetch, { page, sort, direction });

	return {
		reserves,
		options: { page, sort, direction }
	};
}
