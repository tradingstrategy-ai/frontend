import { fetchPublicApi } from '$lib/helpers/public-api';

// https://tradingstrategy.ai/api/explorer/#/default/web_chain_details
export async function load({ fetch }) {
	return {
		chains: await fetchPublicApi(fetch, 'chains')
	};
}
