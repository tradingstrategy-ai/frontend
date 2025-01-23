import { z } from 'zod';
import { hexString } from '$lib/eth-defi/schemas/core';
import { currencyBalanceSchema, tokenBalanceSchema, tokenInfoSchema } from '$lib/eth-defi/schemas/token';
import { transactionLog } from '$lib/eth-defi/schemas/transaction';

const dataSchema = z
	.object({
		nativeCurrency: currencyBalanceSchema,
		denominationToken: tokenInfoSchema,
		vaultShares: tokenBalanceSchema,
		vaultNetValue: tokenBalanceSchema,
		shares: z.string(),
		transactionId: hexString,
		transactionLogs: transactionLog.array(),
		errorMessage: z.string(),
		redemptionState: z.string()
	})
	.partial();

export type RedeemWizardDataSchema = typeof dataSchema;

export type RedeemWizardData = z.infer<RedeemWizardDataSchema>;

export async function load() {
	return {
		slug: 'redeem',

		title: 'Redeem tokens',

		steps: [
			{ slug: 'introduction', label: 'Introduction' },
			{ slug: 'connect', label: 'Connect your wallet' },
			{ slug: 'deposit-status', label: 'Deposit status' },
			{ slug: 'shares-redemption', label: 'Shares redemption' },
			{ slug: 'success', label: 'Success' }
		],

		dataSchema
	};
}
