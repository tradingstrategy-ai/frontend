import { publicApiError } from '$lib/helpers/public-api';
import { type TopVaults, topVaultsSchema } from './schemas';
import { getChain } from '$lib/helpers/chain';

const TOP_VAULTS_URL = 'https://top-defi-vaults.tradingstrategy.ai/top_vaults_by_chain.json';

export async function fetchTopVaults(
	fetch: Fetch,
	{ chainId, chainSlug }: { chainId?: number; chainSlug?: string } = {}
): Promise<TopVaults> {
	const resp = await fetch(TOP_VAULTS_URL);
	if (!resp.ok) throw await publicApiError(resp);

	// eslint-disable-next-line prefer-const
	let { vaults, generated_at } = topVaultsSchema.parse(await resp.json());

	// filter by chain if provided
	chainId ??= getChain(chainSlug)?.id;
	if (chainId) {
		vaults = vaults.filter(({ chain_id }) => chain_id === chainId);
	}

	return { vaults, generated_at };
}
