/**
 * Fetch the chart sources
 */
import { getConfiguredStrategyById } from 'trade-executor/strategy/configuration';
import { fetchChartData } from '../../chart';

// Charts cannot be loaded on the server-side
export const ssr = false;

export async function load({ params, fetch }) {
	const { url } = getConfiguredStrategyById(params.strategy)!;

	// Netflow page can only display statistics relevant for live trading
	const source = 'live_trading';
	const tvlChart = fetchChartData(fetch, url, { type: 'total_equity', source });
	const netflowChart = fetchChartData(fetch, url, { type: 'netflow', source });

	return { tvlChart, netflowChart };
}
