import type { GetBalanceReturnType, GetTransactionReceiptReturnType } from '@wagmi/core';
import type { GetTokenBalanceReturnType, TokenInfo } from '$lib/eth-defi/helpers';

export type RedeemWizardData = {
	nativeCurrency?: GetBalanceReturnType;
	denominationToken?: TokenInfo;
	vaultShares?: GetTokenBalanceReturnType;
	vaultNetValue?: GetTokenBalanceReturnType;
	shares?: string;
	transactionId?: Address;
	transactionLogs?: GetTransactionReceiptReturnType['logs'];
	errorMessage?: string;
	redemptionState?: string;
};

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
		]
	};
}
