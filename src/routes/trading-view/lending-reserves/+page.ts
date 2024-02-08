import { fetchLendingReserves } from '$lib/explorer/lending-reserve-client';

export async function load({ fetch }) {
	// Fetching all reserves and using client-side pagination/sort for now
	return await fetchLendingReserves(fetch, { page_size: 1000 });
}
