import { config } from '$lib/wallet/client';
import { getAccount, getBalance } from '@wagmi/core';

export async function load({ parent }) {
	const { chain, vault } = await parent();
	const { address } = getAccount(config) as { address: Address };

	return {
		nativeCurrency: await getBalance(config, { address, chainId: chain.id }),
		denominationToken: await vault.getDenominationTokenBalance(config, address)
	};
}
