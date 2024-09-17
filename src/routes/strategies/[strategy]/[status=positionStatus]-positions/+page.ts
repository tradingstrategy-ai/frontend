import { getTradingPositionInfoArray } from 'trade-executor/state/position-info.js';

export async function load({ params, parent }) {
	// status can be `open`, `closed` or `frozen` (see params/positionStatus.ts)
	const { status } = params;
	const { admin, strategy, state } = await parent();
	const { hiddenPositions } = strategy;

	let positions = getTradingPositionInfoArray(state, status);

	if (!admin) {
		positions = positions.filter((p) => !hiddenPositions.includes(p.position_id));
	}

	return { positions, status };
}
