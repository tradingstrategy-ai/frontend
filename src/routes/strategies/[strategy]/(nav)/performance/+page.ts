/**
 * Fetch the chart sources
 */
import { error } from '@sveltejs/kit';
import { fetchChartData } from '../../chart';

// Plotly.js cannot be loaded on the server-side
export const ssr = false;

export async function load({ parent, fetch }) {
	// See layout.ts load()
	const { strategy } = await parent();
	const { url } = strategy;

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
