/**
 * Fetch the chart sources
 */
import { error } from '@sveltejs/kit';
import { getConfiguredStrategyById } from 'trade-executor/strategy/configuration';
import { fetchChartData } from '../../chart';

// Charts cannot be loaded on the server-side
export const ssr = false;

export async function load({ params, fetch }) {
	const { url } = getConfiguredStrategyById(params.strategy)!;

	const handleError = (e: Error) => {
		const stack = [`Error loading data from URL: ${url}`, e.message];
		throw error(503, { message: 'Service Unavailable', stack });
	};

	// Netflow page can only display statistics relevant for live trading
	const source = 'live_trading';
	const tvlChart = fetchChartData(fetch, url, { type: 'total_equity', source }).catch(handleError);
	const netflowChart = fetchChartData(fetch, url, { type: 'netflow', source }).catch(handleError);

	return { tvlChart, netflowChart };
}
