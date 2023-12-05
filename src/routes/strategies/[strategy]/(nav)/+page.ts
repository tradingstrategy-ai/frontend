/**
 * Fetch the chart sources
 */
import { getConfiguredStrategyById } from 'trade-executor/strategy/configuration';
import { fetchChartData } from '../chart';

export async function load({ params, fetch }) {
	const { url } = getConfiguredStrategyById(params.strategy)!;

	const profitabilityChart = fetchChartData(fetch, url, {
		type: 'compounding_realised_profitability',
		source: 'live_trading'
	});

	return { streamed: { profitabilityChart } };
}
