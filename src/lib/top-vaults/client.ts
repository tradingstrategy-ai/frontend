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

	const { vaults, generated_at } = topVaultsSchema.parse(await resp.json());

	// sort by 1m return descending
	vaults.sort((a, b) => b['1m_return'] - a['1m_return']);

	// filter by chain if provided
	chainId ??= getChain(chainSlug)?.id;
	const rows = chainId ? vaults.filter((vault) => vault.chain === chainId) : vaults;

	// summary data
	let current_tvl_usd = 0;
	let peak_tvl_usd = 0;

	for (const vault of vaults) {
		current_tvl_usd += vault.current_tvl_usd ?? 0;
		peak_tvl_usd += vault.peak_tvl_usd ?? 0;
	}

	return {
		rows,
		generated_at,
		current_tvl_usd,
		peak_tvl_usd
	};
}
