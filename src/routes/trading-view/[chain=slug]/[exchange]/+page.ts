import { type ExchangeDetails, isUnknownExchangeName } from '$lib/helpers/exchange';
import { fetchPublicApi } from '$lib/helpers/public-api';

/**
 * NOTE: this `load` function is reused by `./export-data/+page.ts`
 * If it changes to require additional data, this may no longer make sense.
 */
export async function load({ params, fetch }) {
	const exchange_slug = params.exchange;
	const chain_slug = params.chain;

	const exchange = await fetchPublicApi<ExchangeDetails>(fetch, 'exchange-details', { exchange_slug, chain_slug });

	return {
		exchange,
		// unnamed factories (slug = contract address) all render the same "Unknown" page
		robots: isUnknownExchangeName(exchange.human_readable_name) ? 'noindex,follow' : undefined
	};
}
