import type { OnChainData } from 'trade-executor/schemas/summary';
import { config } from '$lib/wallet/client';
import { getAccount, getBalance } from '@wagmi/core';
import { getDenominationTokenBalance } from '$lib/eth-defi/helpers';

export async function load({ parent }) {
	const { address } = getAccount(config) as { address: Address };
	const { chain, strategy } = await parent();

	const chainId = chain.id;

	return {
		nativeCurrency: await getBalance(config, { address, chainId }),
		denominationToken: await fetchDenominationToken(chainId, strategy.on_chain_data, address)
	};
}

// TODO: refactor into vault adapter layer
function fetchDenominationToken(chainId: number, onChainData: OnChainData, address: Address) {
	if (onChainData.asset_management_mode !== 'enzyme') return;
	const { comptroller } = onChainData.smart_contracts;
	return getDenominationTokenBalance(config, { address, comptroller, chainId });
}
