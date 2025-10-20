import { publicApiError } from '$lib/helpers/public-api';
import { topVaultsSchema } from './schemas';

const TOP_VAULTS_URL = 'https://top-defi-vaults.tradingstrategy.ai/top_vaults_by_chain.json';

export async function fetchTopVaults(fetch: Fetch) {
	const resp = await fetch(TOP_VAULTS_URL);
	if (!resp.ok) throw await publicApiError(resp);
	return topVaultsSchema.parse(await resp.json());
}
