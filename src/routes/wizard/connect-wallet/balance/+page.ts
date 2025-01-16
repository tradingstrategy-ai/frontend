import type { ConnectWizardData } from '../+layout';
import { get } from 'svelte/store';
import { wizard } from '$lib/wizard/store';
import { config } from '$lib/wallet/client';
import { getAccount, getBalance } from '@wagmi/core';

export async function load() {
	const { address } = getAccount(config) as { address: Address };
	const { chainId } = get(wizard).data as ConnectWizardData;

	return {
		nativeCurrency: await getBalance(config, { address, chainId }),
		denominationToken: undefined
		// TODO: fetch based on token address passed into wizard
		// denominationToken: await fetchDenominationToken(chainId, onChainData, address)
	};
}
