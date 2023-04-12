import { fetchPublicApi } from '$lib/helpers/public-api';

export async function load({ fetch }) {
	return {
		chains: fetchPublicApi(fetch, 'chains')
	};
}
