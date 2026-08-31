import { json } from '@sveltejs/kit';
import { buildTvlChartData, parseChartMinTvl } from '$lib/server/top-vaults/chart-data';
import { getCachedTopVaults } from '$lib/top-vaults/cache';

export async function GET({ fetch, url }) {
	const minTvl = parseChartMinTvl(url.searchParams.get('minTvl'));
	const colourBy = url.searchParams.get('colourBy') === 'protocol' ? 'protocol' : 'chain';
	return json(buildTvlChartData((await getCachedTopVaults(fetch)).vaults, colourBy, minTvl));
}
