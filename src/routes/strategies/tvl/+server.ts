/**
 * TVL API endpoint.
 *
 * Give list of vault
 * - chains
 * - addresses
 * - TVLs
 *
 * Consumed by DefiLlama https://github.com/DefiLlama/DefiLlama-Adapters/tree/main and other data aggregators.
 *
 * Examples
 * - Beefy adapter https://github.com/DefiLlama/DefiLlama-Adapters/blob/main/projects/beefy/index.js
 * - Beefy TVL API https://api.beefy.finance/tvl
 */

import { json } from '@sveltejs/kit';

import { getCachedStrategies } from 'trade-executor/models/strategy-info';
import type { StrategySummaryStatistics } from 'trade-executor/schemas/summary';

type PartialSummaryStatistics = Partial<StrategySummaryStatistics>;

// Per vault TVL record in the export
// Per DefiLLama's policy, the DefiLlama adapter ignores cachedTVLUSD and re-reads this data on-chain
interface StrategyTVL {
	id: string; // e.g.polygon-multipair-momentum
	frontend_url: string; // e.g. https://tradingstrategy.ai/strategies/polygon-multipair-momentum
	trade_executor_url: string; // e.g. https://polygon-multipair-momentum.tradingstrategy.ai'
	name: string | null;
	short_description: string | null;
	chain_id: number | null;
	address: string;
	asset_management_mode: 'enzyme' | 'hot_wallet' | 'simple_vault' | 'velvet' | null;
	tvl_usd: number | null;
	summary_statistics: PartialSummaryStatistics;
}

// The export main interface description
interface ProtocolTVL {
	// Sum of cached TVLs
	total_tvl_usd: number;
	strategies: Record<string, StrategyTVL>;
}

// API end point to get the TVL and misc information of all configured strategies at the frontend.
// Currently, this includes strategies not yet visible on the main frontend listing.
export async function GET({ fetch }) {
	const strategies = await getCachedStrategies(fetch);
	const result: ProtocolTVL = { total_tvl_usd: 0, strategies: {} };
	for (const strat of strategies) {
		console.log(strat);
		const id = strat.id;

		// Legacy strategies not having their chain_id value configured
		// Ignore them as they are not critical for the export
		const chain_id = strat.on_chain_data?.chain_id ?? null;
		if (!chain_id) {
			console.warn(`chain_id missing for strategy: ${id}`);
		}

		// Strategy does not have key metrics calculated or is down
		const tvl = strat.summary_statistics?.key_metrics?.total_equity?.value ?? 0;
		if (!tvl) {
			// We can still continue because DefiLlama will do its own on-chain reading
			console.warn(`Bad strategy TVL: ${id}`);
		}

		const address = strat.on_chain_data?.smart_contracts?.vault ?? strat.on_chain_data?.trade_executor_hot_wallet;
		if (!address) {
			// The trade-executor likely down
			// TODO: cache and use a cached value
			console.warn(`address missing for strategy: ${id}`);
			continue;
		}

		const asset_management_mode = strat.on_chain_data?.asset_management_mode ?? null;

		const summary_statistics: PartialSummaryStatistics = structuredClone(strat.summary_statistics ?? {});
		// Decrease the payload size by deleting data we do not need to export
		delete summary_statistics.performance_chart_90_days;

		// Sum the total TVL
		result.total_tvl_usd += tvl;

		result.strategies[id] = {
			id,
			frontend_url: `https://tradingstrategy.ai/srategies/${id}`,
			trade_executor_url: strat.url,
			name: strat?.name ?? null,
			short_description: strat?.short_description ?? null,
			chain_id,
			address,
			asset_management_mode,
			tvl_usd: tvl,
			summary_statistics
		};
	}

	return json(result);
}
