import { getChain } from '$lib/helpers/chain';
import type { PageServerLoad } from './$types';

const DATA_ENDPOINT = 'https://top-defi-vaults.tradingstrategy.ai/top_vaults_by_chain.json';

type RemoteVault = {
	name: string;
	protocol?: string | null;
	denomination?: string | null;
	management_fee?: number | null;
	performance_fee?: number | null;
	current_tvl_usd?: number | null;
	peak_tvl_usd?: number | null;
	'1m_return'?: number | null;
	'1m_return_ann'?: number | null;
	'3m_return'?: number | null;
	'3m_return_ann'?: number | null;
	'3m_sharpe'?: number | null;
	'3m_volatility'?: number | null;
	lifetime_return?: number | null;
	lifetime_return_ann?: number | null;
	age_years?: number | null;
	deposit_redeem_count?: number | null;
	first_deposit?: string | null;
	last_deposit?: string | null;
	address?: string | null;
	id: string;
	chain: number;
};

type VaultGroup = {
	chainId: number;
	chainLabel: string;
	chainSlug: string;
	totalTvlUsd: number;
	totalPeakTvlUsd: number;
	vaults: RemoteVault[];
};

export const load: PageServerLoad = async ({ fetch }) => {
	const resp = await fetch(DATA_ENDPOINT);
	if (!resp.ok) {
		throw new Error(`Failed to fetch top vault data: ${resp.status} ${resp.statusText}`);
	}

	const { generated_at: generatedAt, vaults = [] } = (await resp.json()) as {
		generated_at: string;
		vaults: RemoteVault[];
	};

	const groupsMap = new Map<number, VaultGroup>();

	for (const vault of vaults) {
		const chainId = vault.chain;
		const currentTvl = vault.current_tvl_usd ?? 0;
		const peakTvl = vault.peak_tvl_usd ?? 0;

		if (!groupsMap.has(chainId)) {
			const chain = getChain(chainId);
			groupsMap.set(chainId, {
				chainId,
				chainLabel: chain?.name ?? `Chain ${chainId}`,
				chainSlug: chain?.slug ?? String(chainId),
				totalTvlUsd: 0,
				totalPeakTvlUsd: 0,
				vaults: []
			});
		}

		const group = groupsMap.get(chainId)!;
		group.vaults.push(vault);
		group.totalTvlUsd += currentTvl;
		group.totalPeakTvlUsd += peakTvl;
	}

	const groups = Array.from(groupsMap.values())
		.map((group) => ({
			...group,
			vaults: [...group.vaults].sort((a, b) => (b.current_tvl_usd ?? 0) - (a.current_tvl_usd ?? 0))
		}))
		.sort((a, b) => b.totalTvlUsd - a.totalTvlUsd);

	return {
		generatedAt,
		groups
	};
};
