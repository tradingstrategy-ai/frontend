/**
 * This endpoint prerenders (at build time) chain lookup data so it can be
 * available app-wide at runtime without hitting the API. This is route is
 * fetched by the root +layout.ts load function and returned as `chainInfo`.
 */
import { json } from '@sveltejs/kit';
import type { ApiChain } from '$lib/helpers/chain';
import { fetchPublicApi } from '$lib/helpers/public-api';

// fetch and render at build-time
export const prerender = true;

export async function GET({ fetch }) {
	let apiChains: ApiChain[];

	try {
		// fetch chains from API
		apiChains = (await fetchPublicApi(fetch, 'chains')) as ApiChain[];
	} catch (e) {
		// fallback to local chain cache if API is unavailable at build time
		apiChains = (await import('./cache.json')).default;
	}

	// limit prerendered chain properties to: chain_id, chain_slug, and chain_name
	const chains: ApiChain[] = apiChains.map((chain) => ({
		chain_id: chain.chain_id,
		chain_slug: chain.chain_slug,
		chain_name: chain.chain_name
	}));

	return json(chains);
}
