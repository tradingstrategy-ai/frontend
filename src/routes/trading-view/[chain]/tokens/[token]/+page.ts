import type { PageLoad } from './$types';
import { backendUrl } from '$lib/config';
import getApiError from '$lib/chain/getApiError';

const apiUrl = `${backendUrl}/token/details`;

export const load: PageLoad = async ({ params, fetch, setHeaders }) => {
	const chain_slug = params.chain;
	const address = params.token;

	const encoded = new URLSearchParams({ chain_slug, address });
	const resp = await fetch(`${apiUrl}?${encoded}`);

	if (!resp.ok) {
		throw getApiError(resp, 'token', [chain_slug, address]);
	}

	// Cache the pair data pages for 30 minutes at the Cloudflare edge so the
	// pages are served really fast if they get popular, and also for speed test
	setHeaders({
		'cache-control': 'public, max-age=1800' // 30 minutes: 30 * 60 = 1800
	});

	return resp.json();
};
