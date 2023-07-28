import type { TradingPosition } from 'trade-executor-frontend/state/interface';
import { error } from '@sveltejs/kit';

export async function load({ params, parent }) {
	const { position: id, status } = params;
	const { state } = await parent();

	// status can be `open`, `closed` or `frozen` (see params/positionStatus.ts)
	const position: TradingPosition = state.portfolio[`${status}_positions`][id];

	if (!position) {
		throw error(404, 'Not found');
	}

	return {
		breadcrumbs: { [id]: `Position #${id}` },
		position,
		status
	};
}
