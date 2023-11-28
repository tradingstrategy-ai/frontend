/**
 * Fetch the chart sources
 */
import { error } from '@sveltejs/kit';
import { getConfiguredStrategyById } from 'trade-executor/strategy/configuration';
import { fetchChartData } from '../../chart';

// Chart cannot be rendered server-side
export const ssr = false;

export async function load({ params, fetch }) {
	const { url } = getConfiguredStrategyById(params.strategy)!;

	// TODO: use backtest data when insufficient trading data?
	const chartParams = {
		type: 'compounding_realised_profitability',
		source: 'live_trading'
	} as const;

	const profitabilityChart = fetchChartData(fetch, url, chartParams).catch((e) => {
		const stack = [`Error loading data from URL: ${url}`, e.message];
		throw error(503, { message: 'Service Unavailable', stack });
	});

	return { profitabilityChart };
}
