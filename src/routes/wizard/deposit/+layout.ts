import type { EnzymeSmartContracts } from 'trade-executor/strategy/summary';
import type { Decimal, HexString } from 'trade-executor/state/utility-types';
import { type ConfiguredChainId, config } from '$lib/wallet';
import { get } from 'svelte/store';
import { wizard } from 'wizard/store';
import { assertNotGeoBlocked } from '$lib/helpers/geo';
import { type TokenInfo, type GetTokenBalanceReturnType, getDenominationTokenInfo } from '$lib/eth-defi/helpers';

export type DepositWizardData = {
	chainId: ConfiguredChainId;
	strategyName: string;
	contracts: EnzymeSmartContracts;
	canForwardPayment: boolean;
	denominationTokenInfo: TokenInfo;
	denominationToken?: GetTokenBalanceReturnType;
	nativeCurrency?: GetTokenBalanceReturnType;
	tosSignature?: HexString | '';
	tosHash?: HexString;
	transactionId?: HexString;
	errorMessage?: string;
	paymentState?: 'initial' | 'authorizing' | 'confirming' | 'processing' | 'failed' | 'completed';
	paymentValue: Decimal;
};

export async function load({ parent }) {
	const { admin, ipCountry } = await parent();
	assertNotGeoBlocked('strategies:deposit', ipCountry, admin);

	const title = 'Deposit tokens';

	let steps = [
		{ slug: 'introduction', label: 'Introduction' },
		{ slug: 'connect', label: 'Connect your wallet' },
		{ slug: 'balance', label: 'Wallet balance' },
		{ slug: 'tos', label: 'Terms of service' },
		{ slug: 'payment', label: 'Payment' },
		{ slug: 'success', label: 'Success' }
	];

	const { chainId, contracts } = get(wizard).data as DepositWizardData;
	const { comptroller, terms_of_service } = contracts;

	// skip "Terms of service" step if no terms_of_service contract
	if (!terms_of_service) {
		steps = steps.filter(({ slug }) => slug !== 'tos');
	}

	// get denomination token info
	const denominationTokenInfo = await getDenominationTokenInfo(config, { chainId, comptroller });

	// USDC can forward payment using transferWithAuthorizations; other tokens can't (yet)
	const canForwardPayment = denominationTokenInfo.symbol === 'USDC';

	wizard.updateData({ denominationTokenInfo, canForwardPayment });

	return { title, steps };
}
