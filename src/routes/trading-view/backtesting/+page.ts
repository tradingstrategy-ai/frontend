import type { PageLoad } from './$types';
import { fetchPublicApi } from '$lib/helpers/public-api';

export const load = (async ({ fetch }) => {
	return {
		datasets: fetchPublicApi(fetch, 'datasets')
	};
}) satisfies PageLoad;
