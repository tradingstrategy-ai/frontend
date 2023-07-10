/**
 * Fetch the chart sources
 */
import { error } from '@sveltejs/kit';
import {getChartData} from "../../chart";

// Plotly.js cannot be loaded on the server-side
export const ssr = false;

export async function load({ parent, fetch, params }) {

	// See layout.ts load()
	const { strategy, summary, state } = await parent();
	const url = strategy.url;

	let profitabilityChart = null;

	// Netflow page can only display statistics relevant for live trading
	const source = "live_trading";

	try {
		// Small data, no benefit to put parallel
		profitabilityChart = await getChartData(url, "compounding_realised_profitability", source, fetch);
	} catch (e) {
		const stack = [`Error loading data from URL: ${url}`, e.message];
		throw error(503, { message: 'Service Unavailable', stack });
	}

	return {
		profitabilityChart,
        strategy,
        state,
        summary
	};
}