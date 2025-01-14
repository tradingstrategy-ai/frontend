import type { Chain } from '$lib/helpers/chain';
import type { EnzymeOnChainData } from 'trade-executor/schemas/summary';
import type { GetTokenBalanceReturnType, TokenInfo } from '$lib/eth-defi/helpers';

export type RedeemWizardData = {
	chain: Chain;
	strategyName: string;
	onChainData: EnzymeOnChainData;
	nativeCurrency?: GetTokenBalanceReturnType;
	denominationToken?: TokenInfo;
	vaultShares?: GetTokenBalanceReturnType;
	vaultNetValue?: GetTokenBalanceReturnType;
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
