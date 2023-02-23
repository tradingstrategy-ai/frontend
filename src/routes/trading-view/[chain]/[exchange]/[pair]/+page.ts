import type { PageLoad } from './$types';
import { backendUrl } from '$lib/config';
import { publicApiError } from '$lib/helpers/publicApiError';

const apiUrl = `${backendUrl}/pair-details`;

// During SSR we only load only pair details; all trading data (price and
// liquidity candles, trading summaries) are done client-side.
export const load = (async ({ params, fetch, setHeaders }) => {
	const chain_slug = params.chain;
	const exchange_slug = params.exchange;
	const pair_slug = params.pair;

	const encoded = new URLSearchParams({ chain_slug, exchange_slug, pair_slug });
	const resp = await fetch(`${apiUrl}?${encoded}`);

	if (!resp.ok) {
		throw await publicApiError(resp);
	}

	// Cache the pair data pages for 30 minutes at the Cloudflare edge so the
	// pages are served really fast if they get popular, and also for speed test
	setHeaders({
		'cache-control': 'public, max-age=1800' // 30 minutes: 30 * 60 = 1800
	});

	return resp.json();
}) satisfies PageLoad;
