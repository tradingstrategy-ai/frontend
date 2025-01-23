import { config } from '$lib/wallet/client';
import { getAccount, getBalance } from '@wagmi/core';
import { getDenominationTokenBalance } from '$lib/eth-defi/helpers';
import type { EnzymeOnChainData } from 'trade-executor/schemas/summary';

export async function load({ parent }) {
	const { address } = getAccount(config) as { address: Address };
	const { chain, strategy } = await parent();

	const onChainData = strategy.on_chain_data as EnzymeOnChainData;
	const { comptroller } = onChainData.smart_contracts;

	const chainId = chain.id;

	return {
		nativeCurrency: await getBalance(config, { address, chainId }),
		denominationToken: await getDenominationTokenBalance(config, { address, comptroller, chainId })
	};
}
