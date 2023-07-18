/**
 * Fetch the chart sources
 */
import { error } from '@sveltejs/kit';
import { fetchChartData } from '../../chart';

// Plotly.js cannot be loaded on the server-side
export const ssr = false;

export async function load({ parent, fetch }) {
	// See layout.ts load()
	const { strategy, summary } = await parent();

	return { strategy, summary };
}
