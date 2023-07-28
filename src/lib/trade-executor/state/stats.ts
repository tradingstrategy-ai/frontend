/**
 * Helpers to extract statistics from the strategy state.
 *
 * Each state blob comes with a separate statistics section that contains portfolio and position statistics.
 *
 * For statistics structure see: https://github.com/tradingstrategy-ai/trade-executor/blob/master/tradeexecutor/state/statistics.py
 */

import type { State, Stats, TradingPosition } from './interface';
import type { PositionStatistics } from './interface';

/**
 * Get the latest portfolio statistics.
 *
 * @return null if state is not loaded
 *
 */
export function getPortfolioLatestStats(state?: State): object | null {
	if (state) {
		return state.stats.portfolio.at(-1);
	}
	return null;
}

/**
 * Get the latest portfolio position statistics.
 *
 * @return null if state is not loaded
 */
export function getPositionLatestStats(position_id: number, stats?: Stats): PositionStatistics {
	if (stats) {
		const positionHistory = stats.positions[position_id];
		if (positionHistory) {
			return positionHistory.at(-1);
		}
	}
	return null;
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
export function createCombinedPositionList(positions: TradingPosition[], stats: Stats): object[] {
	let rows = [];

	for (let position of positions) {
		const positionStats = getPositionLatestStats(position.position_id, stats) || {};
		const finalStats = stats.closed_positions[position.position_id] || {};
		const merged = { ...position, ...positionStats, ...finalStats };
		merged.ticker = `${position.pair.base.token_symbol}-${position.pair.quote.token_symbol}`;
		rows.push(merged);
	}
	return rows;
}
