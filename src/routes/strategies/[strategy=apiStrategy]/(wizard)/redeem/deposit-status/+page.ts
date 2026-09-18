import { config } from '$lib/wallet/client';
import { getBalance } from '@wagmi/core';
import { getWizardAccount } from '$lib/wallet/wizard-account';

export async function load({ parent }) {
	const { chain, vault, strategy, slug } = await parent();
	const address = getWizardAccount(strategy.id, slug);

	return {
		tokenPromises: {
			nativeCurrency: getBalance(config, { address, chainId: chain.id }),
			vaultShares: vault.getShareBalance(config, address),
			vaultNetValue: vault.getShareValueUSD(config, address)
		}
	};
}
