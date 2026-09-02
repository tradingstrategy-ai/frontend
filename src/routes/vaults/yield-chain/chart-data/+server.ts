import { json } from '@sveltejs/kit';
import { buildYieldChartData, parseChartMinTvl } from '$lib/server/top-vaults/chart-data';
import { getCachedTopVaults } from '$lib/top-vaults/cache';

export async function GET({ fetch, url }) {
	const minTvl = parseChartMinTvl(url.searchParams.get('minTvl'));
	return json(buildYieldChartData((await getCachedTopVaults(fetch)).vaults, 'chain', minTvl));
}
