import { getAddress } from 'viem';
import type { LendingReserve } from '$lib/explorer/lending-reserve-client.js';
import { fetchPublicApi } from '$lib/helpers/public-api';

export async function load({ params, fetch }) {
	const reserve = (await fetchPublicApi(fetch, 'lending-reserve/details', {
		chain_slug: params.chain,
		protocol_slug: params.protocol,
		reserve_slug: params.reserve
	})) as LendingReserve;

	// FIXME: temporary transformation until backend bug #202 is fixed
	// https://github.com/tradingstrategy-ai/backend/issues/202
	const assetAddress = getAddress(reserve.asset_address);
	const snapshot = reserve.additional_details.raw_reserves_snapshot;
	snapshot.reserve = snapshot.reserves[assetAddress];
	snapshot.reserve.decimals = Number(snapshot.reserve.decimals);
	delete snapshot.reserves;
	delete reserve.additional_details.raw_reserves_snapshot;
	reserve.additional_details.raw_snapshot = snapshot;

	return { reserve };
}
