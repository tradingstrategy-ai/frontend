import { config } from '$lib/wallet/client';
import { getBalance } from '@wagmi/core';
import { getWizardAccount } from '$lib/wallet/wizard-account';

export async function load({ parent }) {
	const { chain, vault, strategy, slug } = await parent();
	const address = getWizardAccount(strategy.id, slug);

	return {
		nativeCurrency: await getBalance(config, { address, chainId: chain.id }),
		denominationToken: await vault.getDenominationTokenBalance(config, address)
	};
}
