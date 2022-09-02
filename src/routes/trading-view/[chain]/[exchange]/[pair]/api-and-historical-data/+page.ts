import type { PageLoad } from './$types';
import { backendUrl } from '$lib/config';
import getApiError from '$lib/chain/getApiError';

const apiUrl = `${backendUrl}/pair-details`;

export const load: PageLoad = async ({ params, fetch, setHeaders }) => {
	const chain_slug = params.chain;
	const exchange_slug = params.exchange;
	const pair_slug = params.pair;

	const encoded = new URLSearchParams({ exchange_slug, chain_slug, pair_slug });
	const resp = await fetch(`${apiUrl}?${encoded}`);

	if (!resp.ok) {
		throw getApiError(resp, 'Trading pair', [chain_slug, exchange_slug, pair_slug]);
	}

	// Cache the pair data pages for 30 minutes at the Cloudflare edge so the
	// pages are served really fast if they get popular, and also for speed test
	setHeaders({
		'cache-control': 'public, max-age=1800' // 30 minutes: 30 * 60 = 1800
	});

	return resp.json();
};
