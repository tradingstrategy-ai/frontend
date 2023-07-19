/**
 * Position status flag.
 */
import type { TradingPosition } from 'trade-executor-frontend/state/interface';

export enum PositionStatusFlag {
	stopLoss,
	takeProfit,
	executionFailed,
	repair,
	accountingCorrected
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
	level: 'info' | 'error';
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

	for (const [tradeId, trade] of Object.entries(position.trades)) {
		const tradeLink = `${baseUrl}/trade-${tradeId}`;

		if (trade.trade_type == 'stop_loss') {
			const msg = `
                <h4>Stop loss triggered</h4>                
                
                <p>This position was closed with a stop loss</p>
                
                <p>Position can still have a profitable close if a trailing or dynamic stop loss was used.</p>
                
                <p>See more</p>
                <ul>
                    <li><a href="${tradeLink}">View the closing trade</li>
                    <li><a href="/glossary/stop-loss">What is a stop loss</li>
                </ul>
            `;

			addFlag(flags, {
				flag: PositionStatusFlag.stopLoss,
				level: 'info',
				abbreviation: 'SL',
				name: 'Stop loss',
				helpTextHTML: msg,
				tradeLink,
				tradeIds: [tradeId as unknown as number]
			});
		}

		if (trade.failed_at) {
			const msg = `
                <h4>Failed trades</h4>                
                
                <p>This position contains failed trades.</p>
                
                <p>Trades may fail for various reasons</p>
                <ul>
                    <li>Blockchain transaction execution fails due to <a href="https://tradingstrategy.ai/glossary/gas-fee">gas fees spiking</a></li>
                    <li>The market was moving too fast and trade failed due to <a href="https://tradingstrategy.ai/glossary/slippage">slippage tolerance exceeded</a> during the trade execution</li>
                    <li>Blockchain nodes or blockchain network malfunctioning</li>
                    <li>Internal technical issues</li>
                </ul>                
                
                <p>
                    Depending on the failure condition, the trade may or may not need manual intervention.
                    Each failed trade has a corresponding repair trade marked with <i>R</i> flag.
                </p>
                
                <p>See more</p>
                <ul>
                    <li><a href="${tradeLink}">View the last failed trade</li>
                </ul>
            `;

			addFlag(flags, {
				flag: PositionStatusFlag.executionFailed,
				level: 'error',
				abbreviation: 'F',
				name: 'Failed trades',
				helpTextHTML: msg,
				tradeLink,
				tradeIds: [tradeId as unknown as number]
			});
		}
	}

	return flags;
}
