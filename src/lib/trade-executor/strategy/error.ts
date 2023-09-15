/**
 * Strategy error handling.
 *
 * There can be multiple failure modes for a trade executor
 *
 * - No connection - the webhook server is down / Internet issue
 *
 * - The trade executor has halted, the main loop aborted with an exception
 *
 * - The trade executor is not halted, but there is capital tied at
 *   frozen positions that need manual interventino
 */

import type { StrategyRuntimeState } from './runtime-state';
import { fromUnixTime } from 'date-fns';
import { formatDatetime, formatDuration } from '$lib/helpers/formatters';

/**
 * Get the HTML error message and help link in the case a trade executor is facing an issue.
 */
export function getTradeExecutorErrorHtml(state: StrategyRuntimeState): string | null {
	const tradeExecutorId = state.id;

	if (!state.connected) {
		return `Trade executor offline. Cannot display the strategy statistics.`;
	} else if (!state.executor_running) {
		// Add a timestamp and relative timestamp for quick diagnostics
		let crashedAtMsg;
		if (state.crashed_at) {
			const diffSeconds = Date.now() / 1000 - state.crashed_at;
			crashedAtMsg = `Strategy executor halted ${formatDatetime(fromUnixTime(state.crashed_at))}, ${formatDuration(
				diffSeconds
			)} ago.`;
		} else {
			crashedAtMsg = '';
		}

		return `Strategy execution is currently paused due to an error. The trade execution engine is waiting for a manual action. 
                <a href="/strategies/${tradeExecutorId}/status">See instance status page for more information</a>. ${crashedAtMsg}`;
	} else if (state.frozen_positions > 0) {
		return `Strategy has currently frozen trading positions that needing manual actions. 
                <a href="/strategies/${tradeExecutorId}/frozen-positions">See frozen positions page for more information</a>.`;
	}

	return null;
}
