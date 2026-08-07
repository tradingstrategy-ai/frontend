import { getTradingPositionInfoArray } from 'trade-executor/models/position-info';
import { topVaultsSchema } from '$lib/top-vaults/schemas';
import { getPositionVaultSparklines } from './vault-sparklines';

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
		const response = await fetch('/top-vaults/all-data');
		if (!response.ok) throw new Error(`Failed to fetch top vaults: ${response.status}`);

		const topVaults = topVaultsSchema.parse(await response.json());
		return getPositionVaultSparklines(positions, topVaults.vaults);
	} catch (error) {
		console.warn('Failed to resolve vault sparklines for position table', error);
		return {};
	}
}
