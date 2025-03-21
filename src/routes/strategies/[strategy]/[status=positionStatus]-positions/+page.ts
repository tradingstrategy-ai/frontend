import { getTradingPositionInfoArray } from 'trade-executor/models/position-info';

export async function load({ params, parent }) {
	// status can be `open`, `closed` or `frozen` (see params/positionStatus.ts)
	const { status } = params;
	const { admin, strategy, state } = await parent();
	const { hiddenPositions } = strategy;

	let positions = getTradingPositionInfoArray(state, status);

	if (!admin) {
		positions = positions.filter((p) => !hiddenPositions.includes(p.position_id));
	}

	const reserves = Object.values(state.portfolio.reserves)[0];

	return { positions, status, reserves };
}
