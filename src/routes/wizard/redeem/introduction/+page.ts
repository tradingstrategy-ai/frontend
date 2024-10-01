import type { EnzymeSmartContracts } from 'trade-executor/strategy/summary';
import { type ConfiguredChainId, config } from '$lib/wallet';
import { get } from 'svelte/store';
import { wizard } from 'wizard/store';
import { getDenominationTokenInfo } from '$lib/eth-defi/helpers';

export async function load() {
	const { chainId, contracts } = get(wizard).data! as { chainId: ConfiguredChainId; contracts: EnzymeSmartContracts };
	const comptroller = contracts.comptroller!;

	return {
		denominationTokenInfo: await getDenominationTokenInfo(config, { chainId, comptroller })
	};
}
