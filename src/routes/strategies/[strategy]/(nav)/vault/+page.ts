import { error } from '@sveltejs/kit';
import type { OnChainData } from 'trade-executor/strategy/summary.js';

export async function load({ parent }) {
	const { strategy } = await parent();

	const onChainData: OnChainData = strategy.on_chain_data;

	if (onChainData?.asset_management_mode !== 'enzyme') {
		throw error(404, 'Not found');
	}

	return { onChainData };
}
