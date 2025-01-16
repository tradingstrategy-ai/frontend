import { config } from '$lib/wallet/client';
import { getAccount, getBalance } from '@wagmi/core';

export async function load({ parent }) {
	const { address } = getAccount(config) as { address: Address };
	const { chain } = await parent();

	return {
		nativeCurrency: await getBalance(config, { address, chainId: chain.id }),
		denominationToken: undefined
		// TODO: fetch based on token address passed into wizard
		// denominationToken: await fetchDenominationToken(chainId, onChainData, address)
	};
}
