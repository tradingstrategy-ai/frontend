import type { LendingReserve } from '$lib/explorer/lending-reserve-client';
import { fetchPublicApi } from '$lib/helpers/public-api';
import { timeBucketEnum } from '$lib/schemas/utility.js';

export async function load({ fetch, params, url }) {
	const reserve = await fetchPublicApi<LendingReserve>(fetch, 'lending-reserve/details', {
		chain_slug: params.chain,
		protocol_slug: params.protocol,
		reserve_slug: params.reserve
	});

	const timeBucketParam = url.searchParams.get('timeBucket');
	const timeBucket = timeBucketEnum.catch('1d').parse(timeBucketParam);

	return { reserve, timeBucket };
}
