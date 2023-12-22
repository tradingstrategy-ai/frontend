import type { PositionStatistics } from './statistics';
import type { TradingPosition } from './position';

type Maybe<Value> = Value | null | undefined;

/**
 * Get position value at the open in US dollar
 *
 */
export function getValueAtOpen(stats: Maybe<PositionStatistics[]>): number | undefined {
	return stats?.[0]?.value;
}

/**
 * Get position value before it was closed
 *
 */
export function getValueAtClose(stats: Maybe<PositionStatistics[]>): number | undefined {
	// At -1 we have updated the position value after close, it is zero if it was properly closed
	// At -2 we have the last valuation before performing the closing
	return stats?.at(-2)?.value;
}

/**
 * Get position value at its peak as US dollar
 *
 */
export function getValueAtPeak(stats: Maybe<PositionStatistics[]>): number | undefined {
	if (!stats || stats.length === 0) return undefined;
	const maxValue = Math.max(...stats.map((s) => s.value));
	return Number.isFinite(maxValue) ? maxValue : undefined;
}

/**
 * Get the last failed trade reason.
 *
 * Note that this will keep returning an error reason if position
 * was fixed after the error happened.
 */
export function getPositionFreezeReason(position: TradingPosition) {
	const lastFailedTrade = Object.values(position.trades).findLast((trade) => trade.failed_at);
	const failedTx = lastFailedTrade?.blockchain_transactions.find((tx) => tx.revert_reason);

	if (!(lastFailedTrade && failedTx)) return;

	return {
		chainId: failedTx.chain_id,
		positionId: lastFailedTrade.position_id,
		tradeId: lastFailedTrade.trade_id,
		revertReason: failedTx.revert_reason!,
		txHash: failedTx.tx_hash!
	};
}

/**
 * Is the position currently in an error state.
 *
 * In the error state
 *
 * - Freeze flag frozen_at is set
 * - Unfrozen flag is not set
 */
export function isPositionInError(position: TradingPosition): boolean {
	return position.frozen_at !== null && position.unfrozen_at === null;
}
