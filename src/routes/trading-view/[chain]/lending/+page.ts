import { fetchLendingReserves } from '$lib/explorer/lending-reserve-client';

export async function load({ fetch, params }) {
	// Fetching all reserves and using client-side pagination/sort for now
	return fetchLendingReserves(fetch, { chain_slug: params.chain, page_size: 1000 });
}
