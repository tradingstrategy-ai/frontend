import type { PageLoad } from './$types';
import type { TradingPosition } from 'trade-executor-frontend/state/interface';

export const load: PageLoad = async ({ params, parent }) => {
	const { status } = params;
	const { state } = await parent();

	// status can be `open`, `closed` or `frozen` (see params/positionStatus.ts)
	const positions = state.portfolio[`${status}_positions`] ?? {};

	return {
		status,
		positions: Object.values(positions) as TradingPosition[]
	};
};
