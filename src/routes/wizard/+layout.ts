import wizard from './wizardState';
import { fetchPublicApi } from '$lib/helpers/public-api';

export const ssr = false;

export async function load({ fetch }) {
	if (!wizard.initializing) wizard.reset();

	const chains = fetchPublicApi(fetch, 'chains').catch((e) => {
		console.error(`Error fetching chains: ${e}`);
	});

	return {
		skipNavbar: true,
		skipFooter: true,
		chains
	};
}
