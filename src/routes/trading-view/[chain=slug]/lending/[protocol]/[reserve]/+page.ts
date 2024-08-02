import type { LendingReserve } from '$lib/explorer/lending-reserve-client.js';
import { fetchPublicApi } from '$lib/helpers/public-api';
import { isCandleTimeBucket } from '$lib/chart/helpers.js';

export async function load({ fetch, params, url }) {
	const reserve = (await fetchPublicApi(fetch, 'lending-reserve/details', {
		chain_slug: params.chain,
		protocol_slug: params.protocol,
		reserve_slug: params.reserve
	})) as LendingReserve;

	const timeBucketParam = url.searchParams.get('timeBucket');
	const timeBucket = isCandleTimeBucket(timeBucketParam) ? timeBucketParam : '1d';

	return { reserve, timeBucket };
}
