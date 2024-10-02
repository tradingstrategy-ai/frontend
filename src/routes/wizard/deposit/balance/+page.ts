import type { DepositWizardData } from '../+layout';
import { get } from 'svelte/store';
import { wizard } from 'wizard/store';
import { config } from '$lib/wallet';
import { getAccount, getBalance } from '@wagmi/core';
import { getDenominationTokenBalance } from '$lib/eth-defi/helpers';

export async function load() {
	const { address } = getAccount(config) as { address: Address };
	const { chainId, contracts } = get(wizard).data as DepositWizardData;
	const { comptroller } = contracts;

	return {
		chainId,
		nativeCurrency: await getBalance(config, { address, chainId }),
		denominationToken: await getDenominationTokenBalance(config, { address, comptroller, chainId })
	};
}
