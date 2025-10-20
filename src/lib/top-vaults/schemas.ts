import { z } from 'zod';
import { chainId, hexString } from '$lib/eth-defi/schemas/core';
import { isoDateTime } from '$lib/schemas/utility';

export const vaultInfoSchema = z.object({
	name: z.string(),
	lifetime_return: z.number(),
	lifetime_return_ann: z.number(),
	'3m_return': z.number().nullable(),
	'3m_return_ann': z.number().nullable(),
	'3m_sharpe': z.number().nullable(),
	'1m_return': z.number(),
	'1m_return_ann': z.number(),
	'3m_volatility': z.number().nullable(),
	denomination: z.string(),
	chain: chainId,
	peak_tvl_usd: z.number(),
	current_tvl_usd: z.number(),
	age_years: z.number(),
	management_fee: z.number().nullable(),
	performance_fee: z.number().nullable(),
	deposit_redeem_count: z.int(),
	protocol: z.string(),
	id: z.string(),
	first_deposit: isoDateTime,
	last_deposit: isoDateTime,
	address: hexString
});
export type VaultInfo = z.infer<typeof vaultInfoSchema>;

export const topVaultsSchema = z.object({
	generated_at: isoDateTime,
	vaults: vaultInfoSchema.array()
});
// See top-vaults/client for TopVaults type def
