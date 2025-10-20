import { publicApiError } from '$lib/helpers/public-api';
import { topVaultsSchema } from './schemas';
import { getChain } from '$lib/helpers/chain';

const TOP_VAULTS_URL = 'https://top-defi-vaults.tradingstrategy.ai/top_vaults_by_chain.json';

export async function fetchTopVaults(
	fetch: Fetch,
	{ chainId, chainSlug }: { chainId?: number; chainSlug?: string } = {}
) {
	const resp = await fetch(TOP_VAULTS_URL);
	if (!resp.ok) throw await publicApiError(resp);

	const vaultData = topVaultsSchema.parse(await resp.json());
	let { vaults } = vaultData;

	// sort by 1m return descending
	vaults.sort((a, b) => b['1m_return'] - a['1m_return']);

	// filter by chain if provided
	chainId ??= getChain(chainSlug)?.id;
	if (chainId) vaults = vaults.filter((vault) => vault.chain === chainId);

	return {
		generated_at: vaultData.generated_at,
		vaults
	};
}
