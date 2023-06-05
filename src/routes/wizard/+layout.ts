import { fetchPublicApi } from '$lib/helpers/public-api';

export const ssr = false;

export async function load({ fetch }) {
	const chains = fetchPublicApi(fetch, 'chains').catch((e) => {
		console.error(`Error fetching chains: ${e}`);
	});

	return {
		skipNavbar: true,
		skipFooter: true,
		chains
	};
}
