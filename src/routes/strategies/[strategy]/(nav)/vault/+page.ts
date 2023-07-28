import { error } from '@sveltejs/kit';
import type { OnChainData } from 'trade-executor-frontend/strategy/runtime-state.js';

export async function load({ parent }) {
	const { summary } = await parent();

	const onChainData: OnChainData = summary.on_chain_data;

	if (onChainData?.asset_management_mode !== 'enzyme') {
		throw error(404, 'Not found');
	}

	return { onChainData };
}
