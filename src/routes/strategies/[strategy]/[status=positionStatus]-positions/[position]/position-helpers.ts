import type { TradingPosition, HexString, PrimaryKey, ChainId } from 'trade-executor-frontend/state/interface';

/**
 * Why a trade was frozen;
 */
export interface FreezeInfo {
	chain: ChainId;
	positionId: PrimaryKey;
	tradeId: PrimaryKey;
	revertReason: string;
	txHash: HexString;
}

/**
 * Get the last failed trade reason.
 *
 * Note that this will keep returning an error reason if position
 * was fixed after the error happened.
 */
export function getPositionFreezeReason(position: TradingPosition): FreezeInfo | null {
	const reverseTrades = Object.values(position.trades).reverse();

	for (const trade of reverseTrades) {
		if (trade.failed_at) {
			for (const tx of trade.blockchain_transactions) {
				if (tx.revert_reason) {
					return {
						chain: tx.chain_id,
						positionId: trade.position_id,
						tradeId: trade.trade_id,
						revertReason: tx.revert_reason,
						txHash: tx.tx_hash
					};
				}
			}
		}
	}

	return null;
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
