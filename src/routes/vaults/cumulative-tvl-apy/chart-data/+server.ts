import { json } from '@sveltejs/kit';
import { buildCumulativeChartData, parseChartMinTvl } from '$lib/server/top-vaults/chart-data';
import { getCachedTopVaults } from '$lib/top-vaults/cache';

export async function GET({ fetch, url }) {
	const minTvl = parseChartMinTvl(url.searchParams.get('tvl'));
	const requestedWindow = url.searchParams.get('window') ?? '1m';
	const window = ['1m', '3m', '6m', '1y', 'all'].includes(requestedWindow) ? requestedWindow : '1m';
	const protocols = (url.searchParams.get('protocols') ?? '').split(',').filter(Boolean);
	return json(buildCumulativeChartData((await getCachedTopVaults(fetch)).vaults, minTvl, window, protocols));
}
