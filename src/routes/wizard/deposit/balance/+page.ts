import type { EnzymeSmartContracts } from 'trade-executor/strategy/summary';
import { get } from 'svelte/store';
import { wizard } from 'wizard/store';
import { type ConfiguredChainId, config } from '$lib/wallet';
import { getAccount, getBalance } from '@wagmi/core';
import { getDenominationToken } from '$lib/eth-defi/helpers';

export async function load() {
	const { address } = getAccount(config) as { address: Address };
	const { chainId, contracts } = get(wizard).data! as { chainId: ConfiguredChainId; contracts: EnzymeSmartContracts };
	const comptroller = contracts.comptroller!;

	return {
		chainId,
		nativeCurrency: await getBalance(config, { address, chainId }),
		denominationToken: await getDenominationToken(config, { address, comptroller, chainId })
	};
}
