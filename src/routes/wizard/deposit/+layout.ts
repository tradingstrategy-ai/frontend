import type { EnzymeSmartContracts } from 'trade-executor/strategy/summary';
import { type ConfiguredChainId, config } from '$lib/wallet';
import { get } from 'svelte/store';
import { wizard } from 'wizard/store';
import { getAccount } from '@wagmi/core';
import { assertNotGeoBlocked } from '$lib/helpers/geo';
import { type GetTokenBalanceReturnType, getDenominationToken } from '$lib/eth-defi/helpers';

export type DepositWizardData = {
	chainId: ConfiguredChainId;
	strategyName: string;
	contracts: EnzymeSmartContracts;
	canForwardPayment: boolean;
	denominationToken: GetTokenBalanceReturnType;
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

	// skip "Terms of service" step if no terms_of_service contract
	if (!contracts.terms_of_service) {
		steps = steps.filter(({ slug }) => slug !== 'tos');
	}

	// get denomination token info and balance
	const denominationToken = await getDenominationToken(config, {
		chainId,
		address: getAccount(config).address!,
		comptroller: contracts.comptroller!
	});

	// USDC can forward payment using transferWithAuthorizations; other tokens can't (yet)
	const canForwardPayment = denominationToken.symbol === 'USDC';

	wizard.updateData({ denominationToken, canForwardPayment });

	return { title, steps };
}
