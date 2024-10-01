import type { EnzymeSmartContracts } from 'trade-executor/strategy/summary';
import { get } from 'svelte/store';
import { wizard } from 'wizard/store';
import { type ConfiguredChainId, config } from '$lib/wallet';
import { getAccount, getBalance } from '@wagmi/core';
import { type GetTokenBalanceReturnType, getDenominationTokenBalance } from '$lib/eth-defi/helpers';

export async function load() {
	const { address } = getAccount(config) as { address: Address };
	const { chainId, contracts } = get(wizard).data! as { chainId: ConfiguredChainId; contracts: EnzymeSmartContracts };
	const { comptroller } = contracts;

	let denominationToken: Promise<GetTokenBalanceReturnType> | undefined = undefined;
	if (comptroller) {
		denominationToken = getDenominationTokenBalance(config, { address, comptroller, chainId });
	}

	return {
		nativeCurrency: await getBalance(config, { address, chainId }),
		denominationToken: await denominationToken
	};
}
