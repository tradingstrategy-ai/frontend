import { fetchPublicApi } from '$lib/helpers/public-api';

export async function load({ fetch }) {
	return {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		datasets: await fetchPublicApi<Record<string, any>[]>(fetch, 'datasets')
	};
}
