/**
 * Fetch the chart sources
 */
import { error } from '@sveltejs/kit';
import {getChartData} from "../../chart";

// Plotly.js cannot be loaded on the server-side
export const ssr = false;

export async function load({ parent, fetch, params }) {
	const { strategy } = await parent();
	const url = strategy.url;

	let tvlChart, netflowChart;

	// Netflow page can only display statistics relevant for live trading
	const source = "live_trading";

	try {
		// Small data, no benefit to put parallel
		tvlChart = await getChartData(url, "total_equity", source, fetch);
		netflowChart = await getChartData(url, "netflow", source, fetch);
	} catch (e) {
		const stack = [`Error loading data from URL: ${url}`, e.message];
		throw error(503, { message: 'Service Unavailable', stack });
	}

	console.log(tvlChart);

	return {
		tvlChart,
		netflowChart,
	};
}
