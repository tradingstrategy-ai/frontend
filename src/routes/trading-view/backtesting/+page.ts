import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import { backendUrl } from '$lib/config';

const apiUrl = `${backendUrl}/datasets`;

/**
 * During SSR, we short-circuit the public Internet and hit the internal API directly (see
 * hooks/index.ts). As a result, the backend does not know the normal (public) url origin for the
 * request. For this API endpoint, the backend uses the Pyramid request.route_url() function to
 * generate download URLs, which depends the URL origin. This is not an issue for client-side
 * initiated requests, as those are routed over the public Internet and handled by Cloudflare.
 * TODO: consider moving this to hooks/index.ts#externalFetch
 */
const { host, protocol } = new URL(backendUrl);
const headers = {
	Host: host,
	'X-Forwarded-Host': host,
	'X-Forwarded-Proto': protocol.slice(0, -1)
};

export const load: PageLoad = async ({ fetch }) => {
	const resp = await fetch(apiUrl, { headers });

	if (!resp.ok) {
		throw error(500, `Error loading ${apiUrl}: ${resp.statusText}`);
	}

	return {
		datasets: await resp.json()
	};
};
