import { createTradingPositionInfo } from 'trade-executor/state/position-info.js';

export async function load({ params, parent }) {
	const { status } = params;
	const { state } = await parent();

	// status can be `open`, `closed` or `frozen` (see params/positionStatus.ts)
	const positions = state.portfolio[`${status}_positions`];

	return {
		status,
		positions: Object.values(positions).map(createTradingPositionInfo)
	};
}
