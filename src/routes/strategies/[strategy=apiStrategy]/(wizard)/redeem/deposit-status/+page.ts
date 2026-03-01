import { config } from '$lib/wallet/client';
import { getAccount, getBalance } from '@wagmi/core';

export async function load({ parent }) {
	const { chain, vault } = await parent();
	const address = getAccount(config).address!;

	return {
		tokenPromises: {
			nativeCurrency: getBalance(config, { address, chainId: chain.id }),
			vaultShares: vault.getShareBalance(config, address),
			vaultNetValue: vault.getShareValueUSD(config, address)
		}
	};
}
