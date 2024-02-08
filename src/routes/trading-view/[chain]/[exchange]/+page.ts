import { fetchPublicApi } from '$lib/helpers/public-api';

/**
 * NOTE: this `load` function is re-exported by `./export-data/+page.ts`
 * If it changes to require additional data, this may no longer make sense.
 */
export async function load({ params, fetch }) {
	const exchange_slug = params.exchange;
	const chain_slug = params.chain;

	return {
		exchange: await fetchPublicApi(fetch, 'exchange-details', { exchange_slug, chain_slug })
	};
}
