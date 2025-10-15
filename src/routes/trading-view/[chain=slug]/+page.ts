import { fetchPublicApi } from '$lib/helpers/public-api';
import { fetchTokens } from '$lib/explorer/token-client';
import { fetchPairs } from '$lib/explorer/pair-client';
import { fetchLendingReserves } from '$lib/explorer/lending-reserve-client';
import { getFormattedReserveUSD } from '$lib/helpers/lending-reserve';
import type { LayoutData } from './$types';

const VAULT_ENDPOINT = 'https://top-defi-vaults.tradingstrategy.ai/top_vaults_by_chain.json';

type RemoteVault = {
	id: string;
	name: string;
	protocol?: string | null;
	chain: number;
	current_tvl_usd?: number | null;
	'1m_return'?: number | null;
};

type VaultRow = {
	id: string;
	name: string;
	protocol?: string;
	tvlUsd: number;
	return1m?: number | null;
};

export async function load({ params, fetch, parent }) {
	const { chain } = params;
	const parentData = (await parent()) as LayoutData;
	const chainId = parentData.chain?.chain_id;

	const emptyVaults = { rows: [] as VaultRow[] };

	return {
		exchanges: fetchTopExchanges(fetch, chain),
		tokens: fetchTopTokens(fetch, chain),
		pairs: fetchTopPairs(fetch, chain),
		reserves: fetchTopReserves(fetch, chain),
		vaults: chainId ? fetchTopVaults(fetch, chainId) : Promise.resolve(emptyVaults)
	};
}

async function fetchTopExchanges(fetch: Fetch, chainSlug: string) {
	try {
		const data = await fetchPublicApi(fetch, 'exchanges', {
			chain_slug: chainSlug,
			sort: 'usd_volume_30d',
			direction: 'desc',
			filter_zero_volume: 'true'
		});
		const rows = data.exchanges
			.filter((row: Record<string, any>) => {
				return !row.human_readable_name.startsWith('Unknown 0x');
			})
			.slice(0, 5);
		return { rows };
	} catch (error) {
		return { error };
	}
}

async function fetchTopTokens(fetch: Fetch, chainSlug: string) {
	try {
		// Using larger page_size due to bug in tokens endpoint
		// see: https://github.com/tradingstrategy-ai/backend/issues/189
		const data = await fetchTokens(fetch, {
			chain_slug: chainSlug,
			sort: 'liquidity_latest',
			page_size: 20
		});
		return { rows: data?.rows.slice(0, 5) ?? [] };
	} catch (error) {
		return { error };
	}
}

async function fetchTopPairs(fetch: Fetch, chainSlug: string) {
	try {
		const data = await fetchPairs(fetch, {
			chain_slugs: chainSlug,
			page_size: 5
		});
		return { rows: data?.rows ?? [] };
	} catch (error) {
		return { error };
	}
}

async function fetchTopReserves(fetch: Fetch, chainSlug: string) {
	try {
		// fetch all reserves for chain since sorting by TVL is not supported
		const data = await fetchLendingReserves(fetch, {
			chain_slug: chainSlug,
			page_size: 1000
		});

		// cache totalLiquidityUSD (TVL) for sorting (Schwarzian transform) and use in TopReserves table
		const rows = data?.rows
			.map((row) => {
				const totalLiquidityUSD = Number(getFormattedReserveUSD(row)?.totalLiquidityUSD ?? 0);
				return { ...row, totalLiquidityUSD };
			})
			.sort((a, b) => b.totalLiquidityUSD - a.totalLiquidityUSD);

		return { rows: rows?.slice(0, 5) ?? [] };
	} catch (error) {
		return { error };
	}
}

async function fetchTopVaults(fetch: Fetch, chainId: number) {
	try {
		const resp = await fetch(VAULT_ENDPOINT);
		if (!resp.ok) {
			throw new Error(`Failed to fetch vault data: ${resp.status} ${resp.statusText}`);
		}

		const { vaults = [] } = (await resp.json()) as {
			vaults?: RemoteVault[];
		};

		const rows = vaults
			.filter((vault) => vault.chain === chainId)
			.sort((a, b) => (b.current_tvl_usd ?? 0) - (a.current_tvl_usd ?? 0))
			.slice(0, 5)
			.map<VaultRow>((vault) => ({
				id: vault.id,
				name: vault.name,
				protocol: vault.protocol ?? undefined,
				tvlUsd: vault.current_tvl_usd ?? 0,
				return1m: vault['1m_return'] ?? null
			}));

		return { rows };
	} catch (error) {
		return { error };
	}
}
