import { fetchPublicApi } from '$lib/helpers/public-api';

export async function load({ fetch }) {
	return {
		datasets: fetchPublicApi(fetch, 'datasets')
	};
}
