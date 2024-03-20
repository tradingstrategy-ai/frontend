import { error } from '@sveltejs/kit';
import { getTradingPositionInfo } from 'trade-executor/state/position-info.js';

export async function load({ params, parent }) {
	// status can be `open`, `closed` or `frozen` (see params/positionStatus.ts)
	const { position: id, status } = params;
	const { state } = await parent();

	const position = getTradingPositionInfo(state, status, id);

	if (!position) {
		throw error(404, 'Not found');
	}

	return {
		breadcrumbs: { [id]: `Position #${id}` },
		position,
		status,
		skipSideNav: true
	};
}
