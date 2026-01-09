import { publicApiError } from '$lib/helpers/public-api';
import { type TopVaults, topVaultsSchema } from './schemas';

// Debug helper to play with new data and bypass Cloudflare
// const TOP_VAULTS_URL = 'https://top-defi-vaults.tradingstrategy.ai/top_vaults_by_chain.json?cache-bust=6';
const TOP_VAULTS_URL = 'https://top-defi-vaults.tradingstrategy.ai/top_vaults_by_chain.json';

export async function fetchTopVaults(fetch: Fetch): Promise<TopVaults> {
	const resp = await fetch(TOP_VAULTS_URL);
	if (!resp.ok) throw await publicApiError(resp);
	return topVaultsSchema.parse(await resp.json());
}
