import type { TokenBalance } from '$lib/eth-defi/schemas/token.js';
import { config } from '$lib/wallet/client';
import { getAccount, getBalance } from '@wagmi/core';

export async function load({ parent }) {
	const { chain, vault } = await parent();
	const { address } = getAccount(config) as { address: Address };

	let denominationTokenPromise: Promise<TokenBalance> | undefined;

	if (vault.depositEnabled()) {
		denominationTokenPromise = vault.getDenominationTokenBalance(config, address);
	}

	return {
		nativeCurrency: await getBalance(config, { address, chainId: chain.id }),
		denominationToken: await denominationTokenPromise
	};
}
