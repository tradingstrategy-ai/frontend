import { fetchTopVaults } from '$lib/top-vaults/client';

export async function load({ fetch }) {
	return {
		topVaults: await fetchTopVaults(fetch)
	};
}
