import type { PageLoad } from '../$types';
import { fetchPublicApi } from '$lib/helpers/public-api';

// https://tradingstrategy.ai/api/explorer/#/Exchange/web_exchanges
export const load = (async ({ fetch }) => {
	return fetchPublicApi(fetch, 'exchanges');
}) satisfies PageLoad;
