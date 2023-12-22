/**
 * Helpers to extract statistics from the strategy state.
 *
 * Each state blob comes with a separate statistics section that contains portfolio and position statistics.
 *
 * For statistics structure see: https://github.com/tradingstrategy-ai/trade-executor/blob/master/tradeexecutor/state/statistics.py
 */

import type { TradingPosition } from './position';
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

/**
 * Mix stats to the trading position list.
 *
 * Creates rows that can present trading positions in a table.
 * Stats are kept in a different state due to how they are refreshed
 * separately on the server.
 *
 * The stats might not be available for a trading position in the case
 *
 * https://github.com/tradingstrategy-ai/trade-executor/blob/master/tradeexecutor/state/statistics.py#L21
 *
 * @return List of row objects that combine both TradingPosition and PositionStatistics vars.
 *
 */
export function createCombinedPositionList(positions: TradingPosition[], stats: Statistics) {
	return positions.map((position) => {
		const positionStats = getPositionLatestStats(position.position_id, stats);
		const finalStats = stats.closed_positions[position.position_id];
		const ticker = `${position.pair.base.token_symbol}-${position.pair.quote.token_symbol}`;

		return {
			...position,
			...positionStats,
			...finalStats,
			ticker
		};
	});
}
