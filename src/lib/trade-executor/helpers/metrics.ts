import type { KeyMetric } from 'trade-executor/schemas/key-metric';
import { relativeReturn, annualizedReturn } from '$lib/helpers/financial';
import { parseDate } from '$lib/helpers/date';

/**
 * Calculate "alternative" CAGR metric locally using the profit data used to
 * render the strategy tile profit chart
 *
 * This is a temporary hack due to issues with the current CAGR calculation
 * in trade-executor; it should be removed once those issues are resolved.
 */
export function calculateAltCagr(profitData: Maybe<[number, number][]>): Maybe<KeyMetric> {
	if (!profitData || profitData.length < 2) return;

	const first = profitData[0];
	const last = profitData.at(-1)!;

	// ensure we have at least 90 days (rounded) of live trading data
	const SECONDS_PER_DAY = 24 * 60 * 60;
	if (Math.round((last[0] - first[0]) / SECONDS_PER_DAY) < 90) return;

	// Get relative return and annualize it
	const periodReturn = relativeReturn(first[1], last[1]);
	const value = periodReturn && annualizedReturn(first[0], last[0], periodReturn);

	// Return data in same format as key metrics from API
	return {
		kind: 'alt_cagr',
		source: 'live_trading',
		value,
		calculation_method: 'historical_data',
		calculation_window_start_at: parseDate(first[0]),
		calculation_window_end_at: parseDate(last[0]),
		help_link: 'https://tradingstrategy.ai/glossary/compound-annual-growth-rate-cagr'
	};
}
