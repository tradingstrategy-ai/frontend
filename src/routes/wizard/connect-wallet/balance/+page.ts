import type { ConnectWizardData } from '../+layout';
import type { OnChainData } from 'trade-executor/schemas/summary';
import { get } from 'svelte/store';
import { wizard } from '$lib/wizard/store';
import { config } from '$lib/wallet/client';
import { getAccount, getBalance } from '@wagmi/core';
import { getDenominationTokenBalance } from '$lib/eth-defi/helpers';

export async function load() {
	const { address } = getAccount(config) as { address: Address };
	const { chain, onChainData } = get(wizard).data as ConnectWizardData;

	const chainId = chain.id;

	return {
		nativeCurrency: await getBalance(config, { address, chainId }),
		denominationToken: await fetchDenominationToken(chainId, onChainData, address)
	};
}

// TODO: refactor into vault adapter layer
function fetchDenominationToken(chainId: number, onChainData: OnChainData, address: Address) {
	console.log(onChainData);

	if (onChainData.asset_management_mode !== 'enzyme') return;
	const { comptroller } = onChainData.smart_contracts;
	return getDenominationTokenBalance(config, { address, comptroller, chainId });
}
