import type { TokenBalance } from '$lib/eth-defi/schemas/token.js';
import { config } from '$lib/wallet/client';
import { getBalance } from '@wagmi/core';
import { getWizardAccount } from '$lib/wallet/wizard-account';

export async function load({ parent }) {
	const { chain, vault, strategy, slug } = await parent();
	const address = getWizardAccount(strategy, slug);

	let denominationTokenPromise: Promise<TokenBalance> | undefined;

	// only vaults with in-app deposits know their denomination token
	if (vault.internalDepositEnabled()) {
		denominationTokenPromise = vault.getDenominationTokenBalance(config, address);
	}

	return {
		nativeCurrency: await getBalance(config, { address, chainId: chain.id }),
		denominationToken: await denominationTokenPromise
	};
}
