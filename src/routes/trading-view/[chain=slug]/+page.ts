import { fetchPublicApi, optionalDataError } from '$lib/helpers/public-api';
import { fetchTokens } from '$lib/explorer/token-client';
import { fetchPairs } from '$lib/explorer/pair-client';
import { fetchLendingReserves } from '$lib/explorer/lending-reserve-client';
import { fetchTopVaults } from '$lib/top-vaults/client';
import { getFormattedReserveUSD } from '$lib/helpers/lending-reserve';

export async function load({ params, fetch }) {
	const { chain } = params;

	return {
		exchanges: fetchTopExchanges(fetch, chain),
		tokens: fetchTopTokens(fetch, chain),
		pairs: fetchTopPairs(fetch, chain),
		reserves: fetchTopReserves(fetch, chain),
		topVaults: await fetchTopVaults(fetch, { chainSlug: chain }).catch(optionalDataError('top vaults'))
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
