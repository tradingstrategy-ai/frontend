import { fetchPublicApi } from '$lib/helpers/public-api';
import { error } from '@sveltejs/kit';

export async function load({ fetch, params, parent }) {
	// page only available to admins
	if (!(await parent()).admin) error(404, 'Not found');

	const pair = await fetchPublicApi(fetch, 'pair-details', {
		chain_slug: params.chain,
		exchange_slug: params.exchange,
		pair_slug: params.pair
	});

	return {
		summary: pair.summary,
		details: pair.additional_details
	};
}
