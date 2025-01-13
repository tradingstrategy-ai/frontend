import type { RedeemWizardData } from '../+layout';
import { config } from '$lib/wallet/client';
import { get } from 'svelte/store';
import { wizard } from '$lib/wizard/store';
import { getDenominationTokenInfo } from '$lib/eth-defi/helpers';

export async function load() {
	const { chain, onChainData } = get(wizard).data as RedeemWizardData;
	const { comptroller } = onChainData.smart_contracts;

	return {
		denominationToken: await getDenominationTokenInfo(config, { chainId: chain.id, comptroller })
	};
}
