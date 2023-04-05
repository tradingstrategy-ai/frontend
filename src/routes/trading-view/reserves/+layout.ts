import type { LayoutLoad } from './$types';
import { fetchPublicApi } from '$lib/helpers/public-api';

export const load = (async ({ fetch }) => {
	return {
		chains: fetchPublicApi(fetch, 'chains')
	};
}) satisfies LayoutLoad;
