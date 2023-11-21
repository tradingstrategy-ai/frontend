/**
 * Fetch the chart sources
 */
import { error } from '@sveltejs/kit';
import { fetchChartData } from '../chart';

export async function load({ parent, fetch }) {
	const { strategy } = await parent();
	const { url } = strategy;

	const chartParams = {
		type: 'compounding_realised_profitability',
		source: 'live_trading'
	} as const;

	// TODO: move error handling into fetchChartData
	const profitabilityChart = fetchChartData(fetch, url, chartParams).catch((e) => {
		const stack = [`Error loading data from URL: ${url}`, e.message];
		throw error(503, { message: 'Service Unavailable', stack });
	});

	return { profitabilityChart };
}