import { z } from 'zod';
import { error } from '@sveltejs/kit';
import { config } from '$lib/wallet/client';
import { currencyBalanceSchema, tokenBalanceSchema } from '$lib/eth-defi/schemas/token';
import { transactionLog } from '$lib/eth-defi/schemas/transaction';

const dataSchema = z
	.object({
		nativeCurrency: currencyBalanceSchema,
		vaultShares: tokenBalanceSchema,
		vaultNetValue: tokenBalanceSchema,
		transactionLogs: transactionLog.array(),
		snapshot: z.record(z.string(), z.any())
	})
	.partial();

export type RedeemWizardDataSchema = typeof dataSchema;

export type RedeemWizardData = z.infer<RedeemWizardDataSchema>;

export async function load({ parent }) {
	const { vault } = await parent();

	if (!vault.internalDepositEnabled()) {
		error(400, 'This strategy does not support deposits.');
	}

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

		dataSchema,

		// re-return type-narrowed vault
		vault,

		denominationToken: await vault.getDenominationTokenInfo(config)
	};
}
