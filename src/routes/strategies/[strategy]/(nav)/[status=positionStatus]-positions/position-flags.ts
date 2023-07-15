/**
 * Position status flag.
 */
import type {TradingPosition} from "trade-executor-frontend/state/interface";


export enum PositionStatusFlag {
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
export interface PositionStatusFlagInformation {
    flag: PositionStatusFlag;
    level: "info" | "error";
    abbreviation: string;
    name: string;
    helpTextHTML: string;

    // Link to the trade raising this flag
    tradeLink: string;

    // Trade ids this flag affects.
    // A position can have multiple trades with the same flag.
    // Any help text links point to the latest trade.
    tradeIds: number[];
}


export type PositionFlagMap = Map<PositionStatusFlag, PositionStatusFlagInformation>;


function addFlag(flags: PositionFlagMap, f: PositionStatusFlagInformation) {
    const existingFlag = flags.get(f.flag);
    // include this trade in trade ids
    f.tradeIds = existingFlag ? existingFlag.tradeIds.concat(f.tradeIds) : f.tradeIds;
    flags.set(f.flag, f);
}


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
 * Flags could be on
 *
 * @param position Trading position for which we generate flags
 *
 * @param baseUrl Where to route help text text links
 *
 */
export function getPositionFlags(position: TradingPosition, baseUrl: string): PositionFlagMap {

    // https://stackoverflow.com/a/38040218/315168
    const flags: PositionFlagMap = new Map();

    for(const [tradeId, trade] of Object.entries(position.trades)) {

        const tradeLink = `{$baseUrl}/${tradeId}`;

        if(trade.trade_type == "stop_loss") {
            addFlag(flags,{
                flag: PositionStatusFlag.stopLoss,
                level: "info",
                abbreviation: "SL",
                name: "Stop loss",
                helpTextHTML: "The position was used with a stop loss.",
                tradeLink,
                tradeIds: [tradeId as unknown as number],
            });
        }

        if(trade.failed_at) {
            addFlag( flags,{
                flag: PositionStatusFlag.executionFailed,
                level: "error",
                abbreviation: "F",
                name: "Failed trades",
                helpTextHTML: "Here is ",
                tradeLink,
                tradeIds: [tradeId as unknown as number],
            });
        }
    }

    return flags;
}