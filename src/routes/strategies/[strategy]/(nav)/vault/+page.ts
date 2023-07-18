/**
 * Fetch the vault data points
 */
import { error } from '@sveltejs/kit';
import { fetchChartData } from '../../chart';

export async function load({ parent, fetch }) {
	// See layout.ts load()
	const { summary } = await parent();

	return {
    onChainData: summary.on_chain_data
  };
}
