import { getTradingPositionInfoArray } from 'trade-executor/models/position-info';
import { fetchPositionVaults, getPositionVaultSparklines } from './vault-sparklines';

export async function load({ params, parent, fetch }) {
	// status can be `open`, `closed` or `frozen` (see params/positionStatus.ts)
	const { status } = params;
	const { admin, strategy, state } = await parent();
	const { hiddenPositions } = strategy;

	let positions = getTradingPositionInfoArray(state, status);

	if (!admin) {
		positions = positions.filter((p) => !hiddenPositions.includes(p.position_id));
	}

	const reserves = Object.values(state.portfolio.reserves)[0];
	const positionVaultSparklines = await loadPositionVaultSparklines(fetch, positions);

	return { positions, status, reserves, positionVaultSparklines };
}

async function loadPositionVaultSparklines(fetch: Fetch, positions: ReturnType<typeof getTradingPositionInfoArray>) {
	const hasVaultPositions = positions.some((position) => position.pair.isVault);
	if (!hasVaultPositions) return {};

	try {
		return getPositionVaultSparklines(positions, await fetchPositionVaults(fetch, positions));
	} catch (error) {
		console.warn('Failed to resolve vault sparklines for position table', error);
		return {};
	}
}
