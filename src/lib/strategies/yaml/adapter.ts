/**
 * Adapt YAML strategy config + vault data into StrategyInfo shape
 * for use in listing components (StrategyTile, StrategyDataSummary, etc.)
 */
import type { VaultInfo } from '$lib/top-vaults/schemas';
import type { ConnectedStrategyInfo } from 'trade-executor/models/strategy-info';
import type { YamlStrategyConfig } from './schema';

/**
 * Create a StrategyInfo-compatible object from YAML config and optional vault data.
 * This allows YAML strategies to be rendered by existing listing components.
 */
export function toListingStrategy(
	config: YamlStrategyConfig,
	vault?: VaultInfo,
	sharePriceReturns?: [number, number][]
): ConnectedStrategyInfo {
	const now = new Date();
	const startDate = vault?.start_date ? new Date(vault.start_date) : null;

	return {
		// StrategyConfiguration fields
		id: config.slug,
		name: config.name,
		url: '', // no backend URL
		hiddenPositions: [],
		frontpage: config.frontpage,
		microsite: false,
		depositExternal: false,
		useSharePrice: true,

		// StrategySummary fields
		icon_url: config.icon_url ?? null,
		short_description: config.short_description,
		long_description: config.long_description ?? null,
		started_at: startDate ?? now,
		executor_running: true,
		frozen_positions: 0,
		error_message: null,
		backtest_available: false,
		crashed_at: null,
		badges: [],
		tags: config.tags,
		sort_priority: config.sort_priority,
		fees: {
			management_fee: vault?.mgmt_fee ?? 0,
			trading_strategy_protocol_fee: 0,
			strategy_developer_fee: vault?.perf_fee ?? 0
		},
		on_chain_data: {
			asset_management_mode: 'hot_wallet' as const,
			chain_id: config.chain_id,
			smart_contracts: {}
		},
		summary_statistics: {
			calculated_at: now,
			launched_at: startDate,
			first_trade_at: null,
			last_trade_at: null,
			enough_data: true,
			current_value: vault?.current_nav ?? null,
			return_all_time: vault?.lifetime_return_net ?? null,
			return_annualised: vault?.cagr_net ?? null,
			share_price_returns_90_days: sharePriceReturns ?? null,
			key_metrics: {
				total_equity: {
					kind: 'total_equity' as const,
					source: 'live_trading',
					value: vault?.current_nav ?? null,
					calculation_method: 'latest_value',
					calculation_window_start_at: startDate,
					calculation_window_end_at: now,
					help_link: null
				},
				started_at: startDate
					? {
							kind: 'started_at' as const,
							source: 'live_trading',
							value: startDate.getTime() / 1000,
							calculation_method: 'latest_value',
							calculation_window_start_at: startDate,
							calculation_window_end_at: now,
							help_link: null
						}
					: undefined,
				sharpe:
					vault?.three_months_sharpe != null
						? {
								kind: 'sharpe' as const,
								source: 'live_trading',
								value: vault.three_months_sharpe,
								calculation_method: 'historical_data',
								calculation_window_start_at: startDate,
								calculation_window_end_at: now,
								help_link: null
							}
						: undefined,
				cagr:
					vault?.cagr_net != null
						? {
								kind: 'cagr' as const,
								source: 'live_trading',
								value: vault.cagr_net,
								calculation_method: 'historical_data',
								calculation_window_start_at: startDate,
								calculation_window_end_at: now,
								help_link: null
							}
						: undefined
			}
		},
		connected: true
	} as ConnectedStrategyInfo;
}
