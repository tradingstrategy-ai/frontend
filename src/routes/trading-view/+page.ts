import { fetchPublicApi, optionalDataError } from '$lib/helpers/public-api';
import { fetchTopVaults } from '$lib/top-vaults/client.js';

export async function load({ fetch, setHeaders }) {
	setHeaders({
		'cache-control': 'public, max-age=300' // 5 minutes: 5 * 60 = 300
	});

	return {
		impressiveNumbers: await fetchPublicApi<Record<string, MaybeNumber>>(fetch, 'impressive-numbers').catch(
			optionalDataError('impressive-numbers')
		),
		topVaults: await fetchTopVaults(fetch).catch(optionalDataError('top-vaults'))
	};
}
