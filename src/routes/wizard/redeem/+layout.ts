import type { Chain } from '$lib/helpers/chain';
import type { EnzymeSmartContracts } from 'trade-executor/schemas/summary';
import type { GetTokenBalanceReturnType } from '$lib/eth-defi/helpers';

export type RedeemWizardData = {
	chain: Chain;
	strategyName: string;
	contracts: EnzymeSmartContracts;
	nativeCurrency?: GetTokenBalanceReturnType;
	denominationToken?: GetTokenBalanceReturnType;
	vaultShares?: GetTokenBalanceReturnType;
	vaultNetBalance?: GetTokenBalanceReturnType;
	transactionId?: Address;
};

export async function load() {
	return {
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
