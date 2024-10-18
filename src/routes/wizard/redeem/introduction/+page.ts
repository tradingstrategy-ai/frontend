import type { RedeemWizardData } from '../+layout';
import { config } from '$lib/wallet/client';
import { get } from 'svelte/store';
import { wizard } from 'wizard/store';
import { getDenominationTokenInfo } from '$lib/eth-defi/helpers';

export async function load() {
	const { chain, contracts } = get(wizard).data as RedeemWizardData;
	const { comptroller } = contracts;

	return {
		denominationTokenInfo: await getDenominationTokenInfo(config, { chainId: chain.id, comptroller })
	};
}
