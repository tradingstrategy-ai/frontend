import { z } from 'zod';
import { blockNumber, chainId, hexString } from '$lib/eth-defi/schemas/core';
import { isoDateTime } from '$lib/schemas/utility';

const nullableNumber = z.number().nullable();

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
	// lockup: nullableNumber,
	event_count: z.int().nullable(),
	protocol: z.string(),
	risk: z.string().nullable(),
	risk_numeric: z.int().nullable(),
	id: z.string(),
	start_date: isoDateTime,
	end_date: isoDateTime,
	address: hexString,
	chain_id: chainId,
	stablecoinish: z.boolean(),
	last_updated_at: isoDateTime,
	last_updated_block: blockNumber,
	features: z.string().array(),
	flags: z.string().array(),
	notes: z.string().nullable(),
	// `link` is deprecated – will be repaced with `deposit_ui_link` and `vault_page_link`
	// Making it `nullish` for now so parse doesn't fail when it's remvoed
	link: z.url().nullish()
});
export type VaultInfo = z.infer<typeof vaultInfoSchema>;

export const topVaultsSchema = z.object({
	generated_at: isoDateTime,
	vaults: vaultInfoSchema.array()
});
export type TopVaults = z.infer<typeof topVaultsSchema>;

export interface VaultProtocol {
	slug: string;
	name: string;
	risk: string | null;
	risk_numeric: number | null;
	vault_count: number;
	tvl: number;
}
