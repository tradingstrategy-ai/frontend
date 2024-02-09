import { getTradingPositionInfoArray } from 'trade-executor/state/position-info.js';

export async function load({ params, parent }) {
	// status can be `open`, `closed` or `frozen` (see params/positionStatus.ts)
	const { status } = params;
	const { state } = await parent();

	const positions = getTradingPositionInfoArray(state, status);

	return { status, positions };
}
