import { z } from 'zod';
import { blockNumber, chainId, vaultAddress } from '$lib/eth-defi/schemas/core';
import { isoDateTime } from '$lib/schemas/utility';

const nullableNumber = z.number().nullable();

/**
 * How fees are collected by the vault.
 * - `externalised`: fees charged on deposit/withdrawal transactions
 * - `feeless`: no fees
 * - `internalised_minting`: fees taken by minting new shares to the fee recipient
 * - `internalised_skimming`: fees deducted from vault NAV
 */
export const feeMode = z.enum(['externalised', 'feeless', 'internalised_minting', 'internalised_skimming']);
export type FeeMode = z.infer<typeof feeMode>;

/**
 * Fee breakdown for a vault, either gross (before protocol revenue share) or net (after).
 * Populated from the backend vault analysis pipeline.
 */
export const vaultFeesSchema = z.object({
	/** How the vault collects fees */
	fee_mode: feeMode.nullable(),
	/** Annual management fee as a decimal (e.g. 0.02 = 2%) */
	management: nullableNumber,
	/** Performance fee as a decimal (e.g. 0.20 = 20% of profits) */
	performance: nullableNumber,
	/** One-time deposit fee as a decimal */
	deposit: nullableNumber,
	/** One-time withdrawal fee as a decimal */
	withdraw: nullableNumber
});
export type VaultFees = z.infer<typeof vaultFeesSchema>;

/** Tearsheet metrics for one period. */
export const periodMetricsSchema = z.object({
	period: z.string(),
	/** Error reason if metrics could not be calculated, null if successful */
	error_reason: z.string().nullable(),
	/** When was start share price sampled */
	period_start_at: isoDateTime,
	/** When was end share price sampled */
	period_end_at: isoDateTime,
	/** Share price at beginning */
	share_price_start: nullableNumber,
	/** Share price at end */
	share_price_end: nullableNumber,
	/** Number of raw datapoints used */
	raw_samples: z.int(),
	samples_start_at: isoDateTime,
	samples_end_at: isoDateTime,
	/** Number of daily datapoints used */
	daily_samples: z.int(),
	/** How much absolute returns we had */
	returns_gross: nullableNumber,
	returns_net: nullableNumber,
	/** Compounding annual returns */
	cagr_gross: nullableNumber,
	cagr_net: nullableNumber,
	/** Annualised volatility, calculated based on daily returns */
	volatility: nullableNumber,
	/** Sharpe ratio */
	sharpe: nullableNumber,
	/** Period maximum drawdown */
	max_drawdown: nullableNumber,
	/** TVL at the start of the period */
	tvl_start: nullableNumber,
	/** TVL at the end of the period */
	tvl_end: nullableNumber,
	/** Minimum TVL in the period */
	tvl_low: nullableNumber,
	/** Maximum TVL in the period */
	tvl_high: nullableNumber,
	/** Rank among all vaults (1 = best), based on CAGR */
	ranking_overall: z.int().nullable(),
	/** Rank among vaults on the same chain (1 = best), based on CAGR */
	ranking_chain: z.int().nullable(),
	/** Rank among vaults in the same protocol (1 = best), based on CAGR */
	ranking_protocol: z.int().nullable()
});
export type PeriodMetrics = z.infer<typeof periodMetricsSchema>;

/**
 * Full vault information returned by the backend top-vaults API.
 * Contains identity, on-chain metadata, performance metrics, fees, and period results.
 * Populated by the backend vault analysis pipeline and cached server-side.
 */
export const vaultInfoSchema = z.object({
	/** Human-readable vault name (e.g. "Aave USDC") */
	name: z.string(),
	/** URL-safe slug for the vault, used in routing (e.g. "aave-usdc") */
	vault_slug: z.string(),
	/** URL-safe slug for the protocol (e.g. "aave-v3") */
	protocol_slug: z.string(),

	// --- Lifetime performance metrics ---
	/** Lifetime gross absolute return as a decimal (e.g. 0.15 = 15%) */
	lifetime_return: nullableNumber,
	/** Lifetime net absolute return (after fees) */
	lifetime_return_net: nullableNumber,
	/** Lifetime compounding annual growth rate (gross) */
	cagr: nullableNumber,
	/** Lifetime compounding annual growth rate (net of fees) */
	cagr_net: nullableNumber,

	// --- Three-month performance metrics ---
	/** Three-month gross absolute return */
	three_months_returns: nullableNumber,
	/** Three-month net absolute return */
	three_months_returns_net: nullableNumber,
	/** Three-month annualised return (gross) */
	three_months_cagr: nullableNumber,
	/** Three-month annualised return (net) */
	three_months_cagr_net: nullableNumber,
	/** Three-month Sharpe ratio (gross) */
	three_months_sharpe: nullableNumber,
	/** Three-month Sharpe ratio (net) */
	three_months_sharpe_net: nullableNumber,
	/** Three-month annualised volatility */
	three_months_volatility: nullableNumber,

	// --- One-month performance metrics ---
	/** One-month gross absolute return */
	one_month_returns: nullableNumber,
	/** One-month net absolute return */
	one_month_returns_net: nullableNumber,
	/** One-month annualised return (gross) */
	one_month_cagr: nullableNumber,
	/** One-month annualised return (net) */
	one_month_cagr_net: nullableNumber,

	// --- Denomination and token info ---
	/** Denomination token symbol (e.g. "USDC") */
	denomination: z.string(),
	/** Normalised denomination name for grouping (e.g. "USD Coin" for USDC variants) */
	normalised_denomination: z.string(),
	/** URL-safe slug for the denomination, used for stablecoin grouping */
	denomination_slug: z.string(),
	/** Share token symbol (e.g. "aUSDC") */
	share_token: z.string(),

	// --- Chain and TVL ---
	/** Human-readable chain name (e.g. "Ethereum") */
	chain: z.string(),
	/** Historical peak net asset value (TVL) in denomination token */
	peak_nav: nullableNumber,
	/** Current net asset value (TVL) in denomination token */
	current_nav: nullableNumber,
	/** Number of years the vault has been active */
	years: nullableNumber,

	// --- Legacy fee fields (prefer gross_fees/net_fees) ---
	/** Management fee as decimal — legacy field, prefer gross_fees/net_fees */
	mgmt_fee: nullableNumber,
	/** Performance fee as decimal — legacy field, prefer gross_fees/net_fees */
	perf_fee: nullableNumber,
	/** Deposit fee as decimal — legacy field */
	deposit_fee: nullableNumber,
	/** Withdrawal fee as decimal — legacy field */
	withdraw_fee: nullableNumber,
	/** Fee mode string — legacy field, prefer gross_fees.fee_mode */
	fee_mode: z.string().nullable(),
	/** Whether fees are internalised (taken from NAV rather than on transactions) */
	fee_internalised: z.boolean().nullable(),
	/** Fee schedule before protocol revenue share */
	gross_fees: vaultFeesSchema.nullable(),
	/** Fee schedule after protocol revenue share (what the user actually pays) */
	net_fees: vaultFeesSchema.nullable(),

	// --- Operational metadata ---
	/** Lockup period in days, null if no lockup */
	lockup: nullableNumber,
	/** Total number of deposit/withdrawal events */
	event_count: z.int().nullable(),
	/** Human-readable protocol name (e.g. "Aave V3") */
	protocol: z.string(),
	/** Risk category label (e.g. "low", "medium", "high") — from technical risk framework */
	risk: z.string().nullable(),
	/** Numeric risk score (1 = lowest risk) — from technical risk framework */
	risk_numeric: z.int().nullable(),
	/** Unique vault identifier from the backend (e.g. "ethereum-aave-v3-usdc") */
	id: z.string(),
	/** When the vault first started tracking data */
	start_date: isoDateTime,
	/** When the vault last had data recorded */
	end_date: isoDateTime,
	/** Vault address: EVM hex (0x...), GRVT (vlt:...), or Hibachi (hibachi-vault-...) */
	address: vaultAddress,
	/** Share token address: EVM hex (0x...), GRVT (vlt:...), or Hibachi (hibachi-vault-...) */
	share_token_address: vaultAddress.nullable(),
	/** Denomination token address: EVM hex (0x...), GRVT (vlt:...), or Hibachi (hibachi-vault-...) */
	denomination_token_address: vaultAddress.nullable(),
	/** Numeric chain ID (e.g. 1 for Ethereum mainnet) */
	chain_id: chainId,
	/** Whether the denomination token is a stablecoin or stablecoin-like */
	stablecoinish: z.boolean(),

	// --- Block tracking ---
	/** When the vault was first indexed */
	first_updated_at: isoDateTime.nullable(),
	/** Block number of first indexing */
	first_updated_block: blockNumber.nullable(),
	/** When the vault data was last refreshed */
	last_updated_at: isoDateTime,
	/** Block number of last data refresh */
	last_updated_block: blockNumber,
	/** Most recent share price in denomination token */
	last_share_price: nullableNumber,

	// --- Feature flags and descriptions ---
	/** Vault feature tags (e.g. "leverage", "auto-compound") */
	features: z.string().array(),
	/** Vault warning/status flags */
	flags: z.string().array(),
	/** Admin notes about the vault */
	notes: z.string().nullable(),
	/** Short description for listing cards */
	short_description: z.string().nullable().optional(),
	/** Full description for the vault detail page */
	description: z.string().nullable().optional(),

	// --- Deposit/redemption status ---
	/** Reason deposits are closed, null if deposits are open */
	deposit_closed_reason: z.string().nullable(),
	/** Reason redemptions are closed, null if redemptions are open */
	redemption_closed_reason: z.string().nullable(),
	/** When deposits will next be open (if currently closed) */
	deposit_next_open: isoDateTime.nullable(),
	/** When redemptions will next be open (if currently closed) */
	redemption_next_open: isoDateTime.nullable(),

	// --- Links ---
	/** @deprecated Use deposit_ui_link and vault_page_link instead */
	link: z.url().nullish(),
	/** Link to this vault on Trading Strategy */
	trading_strategy_link: z.url().nullish(),

	// --- Display helpers ---
	/** Pre-formatted fee label for display (e.g. "2% mgmt + 20% perf") */
	fee_label: z.string().nullable(),

	// --- Period sampling metadata ---
	/** Start of the one-month measurement window */
	one_month_start: isoDateTime.nullable(),
	/** End of the one-month measurement window */
	one_month_end: isoDateTime.nullable(),
	/** Number of data samples in the one-month window */
	one_month_samples: z.int().nullable(),
	/** Start of the three-month measurement window */
	three_months_start: isoDateTime.nullable(),
	/** End of the three-month measurement window */
	three_months_end: isoDateTime.nullable(),
	/** Number of data samples in the three-month window */
	three_months_samples: z.int().nullable(),
	/** Start of the lifetime measurement window */
	lifetime_start: isoDateTime.nullable(),
	/** End of the lifetime measurement window */
	lifetime_end: isoDateTime.nullable(),
	/** Number of data samples in the lifetime window */
	lifetime_samples: z.int().nullable(),

	/** Detailed per-period performance metrics (e.g. 1d, 7d, 30d, 90d, 1y, all-time) */
	period_results: periodMetricsSchema.array(),

	/** Protocol-specific metadata (e.g. Morpho flags) */
	other_data: z
		.object({
			/** Morpho vault-level warning flags (e.g. "not_whitelisted", "short_timelock") */
			morpho_vault_flags: z.string().array(),
			/** Morpho market-level warning flags */
			morpho_market_flags: z.string().array()
		})
		.nullable()
		.optional()
});
export type VaultInfo = z.infer<typeof vaultInfoSchema>;

/** Slim vault info with only the fields needed for listing/summary views (e.g., landing page). */
export type SlimVaultInfo = Pick<
	VaultInfo,
	| 'id'
	| 'name'
	| 'vault_slug'
	| 'protocol_slug'
	| 'protocol'
	| 'chain'
	| 'chain_id'
	| 'current_nav'
	| 'one_month_cagr'
	| 'one_month_cagr_net'
	| 'risk_numeric'
	| 'stablecoinish'
>;

/**
 * Slim vault listing payload used on the landing page.
 * Contains only the fields needed for summary cards and the vault carousel.
 * Produced server-side by mapping full VaultInfo through slimVault().
 */
export interface SlimTopVaults {
	/** When the backend last regenerated the vault dataset */
	generated_at: Date | string;
	/** Array of slim vault records with only listing-relevant fields */
	vaults: SlimVaultInfo[];
}

/**
 * Pre-computed aggregate metrics for the landing page hero banner.
 * Computed server-side from the full vault dataset to avoid shipping all vaults to the client.
 */
export interface VaultAggregates {
	/** Sum of current_nav across all eligible vaults (USD) */
	totalTvl: number;
	/** TVL-weighted average one-month annualised return across eligible vaults */
	weightedAvgApy: number;
	/** Number of vaults that meet minimum TVL and are not blacklisted */
	rankedVaultCount: number;
}

/** Keys included in SlimVaultInfo — used to strip full vault objects at runtime. */
export const slimVaultKeys = [
	'id',
	'name',
	'vault_slug',
	'protocol_slug',
	'protocol',
	'chain',
	'chain_id',
	'current_nav',
	'one_month_cagr',
	'one_month_cagr_net',
	'risk_numeric',
	'stablecoinish'
] as const satisfies readonly (keyof SlimVaultInfo)[];

/**
 * Full top-vaults API response. Contains generation timestamp and all vault records.
 * Fetched from the backend, cached server-side in cache.ts, and served via
 * /top-vaults/all-data (Brotli-compressed) for client-side consumption.
 */
export const topVaultsSchema = z.object({
	/** When the backend last regenerated the vault dataset */
	generated_at: isoDateTime,
	/** All tracked vaults with full performance and metadata */
	vaults: vaultInfoSchema.array()
});
export type TopVaults = z.infer<typeof topVaultsSchema>;

/**
 * Aggregated vault group used on index pages (protocols, chains, stablecoins).
 * Each group summarises all eligible vaults sharing a common attribute.
 * Computed server-side in +page.server.ts from the shared vault cache.
 */
export interface VaultGroup {
	/** URL-safe identifier — protocol slug, chain slug, or denomination slug */
	slug: string;
	/** Display name for the group (e.g. "Aave V3", "Ethereum", "USDC") */
	name: string;
	/** Full human-readable name — only present on stablecoin groups (e.g. "USD Coin") */
	fullName?: string;
	/** Number of eligible vaults in this group */
	vault_count: number;
	/** Total TVL across all vaults in the group (sum of current_nav) */
	tvl: number;
	/** TVL-weighted average one-month annualised return; null if no vaults have APY data */
	avg_apy?: number | null;
	/** Risk category label — only present on protocol groups */
	risk?: string | null;
	/** Numeric risk score — only present on protocol groups */
	risk_numeric?: number | null;
}
