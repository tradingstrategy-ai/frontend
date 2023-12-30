/**
 * Helpers to extract statistics from the strategy state.
 *
 * Each state blob comes with a separate statistics section that contains portfolio and position statistics.
 *
 * For statistics structure see: https://github.com/tradingstrategy-ai/trade-executor/blob/master/tradeexecutor/state/statistics.py
 */

import type { State } from './state';
import type { Statistics } from './statistics';

/**
 * Get the latest portfolio statistics.
 *
 */
export function getPortfolioLatestStats(state?: State) {
	return state?.stats.portfolio.at(-1);
}

/**
 * Get the latest portfolio position statistics.
 *
 */
export function getPositionLatestStats(position_id: number, stats?: Statistics) {
	return stats?.positions[position_id]?.at(-1);
}
