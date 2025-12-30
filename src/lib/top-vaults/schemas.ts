import { z } from 'zod';
import { blockNumber, chainId, hexString } from '$lib/eth-defi/schemas/core';
import { isoDateTime } from '$lib/schemas/utility';

const nullableNumber = z.number().nullable();

export const feeMode = z.enum(['externalised', 'feeless', 'internalised_minting', 'internalised_skimming']);

export const vaultFeesSchema = z.object({
	fee_mode: feeMode.nullable(),
	management: nullableNumber,
	performance: nullableNumber,
	deposit: nullableNumber,
	withdraw: nullableNumber
});

export const vaultInfoSchema = z.object({
	name: z.string(),
	vault_slug: z.string(),
	protocol_slug: z.string(),
	lifetime_return: nullableNumber,
	lifetime_return_net: nullableNumber,
	cagr: nullableNumber,
	cagr_net: nullableNumber,
	three_months_returns: nullableNumber,
	three_months_returns_net: nullableNumber,
	three_months_cagr: nullableNumber,
	three_months_cagr_net: nullableNumber,
	three_months_sharpe: nullableNumber,
	three_months_sharpe_net: nullableNumber,
	three_months_volatility: nullableNumber,
	one_month_returns: nullableNumber,
	one_month_returns_net: nullableNumber,
	one_month_cagr: nullableNumber,
	one_month_cagr_net: nullableNumber,
	denomination: z.string(),
	normalised_denomination: z.string(),
	denomination_slug: z.string(),
	share_token: z.string(),
	chain: z.string(),
	peak_nav: nullableNumber,
	current_nav: nullableNumber,
	years: nullableNumber,
	mgmt_fee: nullableNumber,
	perf_fee: nullableNumber,
	deposit_fee: nullableNumber,
	withdraw_fee: nullableNumber,
	fee_mode: z.string().nullable(),
	fee_internalised: z.boolean().nullable(),
	gross_fees: vaultFeesSchema.nullable(),
	net_fees: vaultFeesSchema.nullable(),
	lockup: nullableNumber,
	event_count: z.int().nullable(),
	protocol: z.string(),
	risk: z.string().nullable(),
	risk_numeric: z.int().nullable(),
	id: z.string(),
	start_date: isoDateTime,
	end_date: isoDateTime,
	address: hexString,
	// share_token_address: hexString.nullable(),
	// denomination_token_address: hexString.nullable(),
	chain_id: chainId,
	stablecoinish: z.boolean(),
	// first_updated_at: isoDateTime.nullable(),
	// first_updated_block: blockNumber.nullable(),
	last_updated_at: isoDateTime,
	last_updated_block: blockNumber,
	// last_share_price: nullableNumber,
	features: z.string().array(),
	flags: z.string().array(),
	notes: z.string().nullable(),
	link: z.url().nullish(), // deprecated – to be repaced with `deposit_ui_link` and `vault_page_link`
	// trading_strategy_link: z.url().nullish(),
	// fee_label: z.string().nullable(),
	one_month_start: isoDateTime.nullable(),
	one_month_end: isoDateTime.nullable(),
	one_month_samples: z.int().nullable(),
	three_months_start: isoDateTime.nullable(),
	three_months_end: isoDateTime.nullable(),
	three_months_samples: z.int().nullable(),
	lifetime_start: isoDateTime.nullable(),
	lifetime_end: isoDateTime.nullable(),
	lifetime_samples: z.int().nullable()
});
export type VaultInfo = z.infer<typeof vaultInfoSchema>;

export const topVaultsSchema = z.object({
	generated_at: isoDateTime,
	vaults: vaultInfoSchema.array()
});
export type TopVaults = z.infer<typeof topVaultsSchema>;

export interface VaultGroup {
	slug: string;
	name: string;
	vault_count: number;
	tvl: number;
	risk?: string | null;
	risk_numeric?: number | null;
}
