import { z } from 'zod';
import { chainId, hexString } from '$lib/eth-defi/schemas/core';
import { isoDateTime } from '$lib/schemas/utility';

const nullableNumber = z.number().nullable();

export const vaultInfoSchema = z.object({
	name: z.string(),
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
	peak_nav: nullableNumber,
	current_nav: nullableNumber,
	years: nullableNumber,
	mgmt_fee: nullableNumber,
	perf_fee: nullableNumber,
	deposit_fee: nullableNumber,
	withdraw_fee: nullableNumber,
	lockup: nullableNumber,
	event_count: z.int().nullable(),
	protocol: z.string(),
	risk: z.string().nullable(),
	id: z.string(),
	start_date: isoDateTime,
	end_date: isoDateTime,
	address: hexString,
	chain_id: chainId
});
export type VaultInfo = z.infer<typeof vaultInfoSchema>;

export const topVaultsSchema = z.object({
	generated_at: isoDateTime,
	vaults: vaultInfoSchema.array()
});
export type TopVaults = z.infer<typeof topVaultsSchema>;
