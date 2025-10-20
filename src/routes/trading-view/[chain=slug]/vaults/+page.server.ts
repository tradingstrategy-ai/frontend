import { fetchTopVaults } from '$lib/top-vaults/client';

export async function load({ fetch, params }) {
	return {
		topVaults: await fetchTopVaults(fetch, { chainSlug: params.chain })
	};
}
