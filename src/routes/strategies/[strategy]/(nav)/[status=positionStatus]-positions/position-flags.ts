/**
 * Position status flag.
 */
import {TradingPosition} from "trade-executor-frontend/state/interface";


enum PositionStatusFlag {
    stopLoss,
    takeProfit,
    executionFailed,
    repair,
    accountingCorrected,
}

/**
 * We may mark various error/warning flags for the position
 *
 * - Unrepaired trades
 * - Repaired trades
 * - Accounting corrections
 *
 * Also trading related
 *
 * - Stop loss hit
 */
interface PositionStatusFlagInformation {
    level: string; // info or error
    abbreviation: string;
    name: string;
    helpTextHTML: string;

    // Link to the trade raising this flag
    tradeLink: string;
}


type PositionFlagMap = Map<PositionStatusFlag, PositionStatusFlagInformation>;

/**
 * Analyse a trading position.
 *
 * Because flags are ad hoc and not serialised,
 * this function duplicates a lot of code from `check_accounts.py`.
 *
 * - Go through all the trades
 *
 * - Check if the trade raises any flags
 *
 * @param position
 */
export function getPositionFlags(position: TradingPosition, strategyId: string, positionCategory: string): PositionFlagMap {

    // https://stackoverflow.com/a/38040218/315168
    const flags: PositionFlagMap = new Map();

    for(const [tradeId, trade] of Object.entries(position.trades)) {

        const tradeLink = `/strategy/${strategyId}/${positionCategory}/${tradeId}`;

        if(trade.trade_type == "stop_loss") {
            const stopLossFlag = {
                level: "info",
                abbreviation: "SL",
                name: "Stop loss",
                helpTextHTML: "",
                tradeLink,
            }
            flags.set(PositionStatusFlag.stopLoss, stopLossFlag);
        }


        if(trade.failed_at) {
            const failedTradesFlag = {
                level: "error",
                abbreviation: "F",
                name: "Failed trades",
                helpTextHTML: "",
                tradeLink,
            }
            flags.set(PositionStatusFlag.executionFailed, failedTradesFlag);
        }
    }

    return flags;
}