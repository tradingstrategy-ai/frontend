import type { EnzymeSmartContracts } from 'trade-executor/schemas/summary';
import { config } from '$lib/wallet/client';
import { getDenominationTokenInfo } from '$lib/eth-defi/helpers';

export async function load({ parent }) {
	const { chain, strategy } = await parent();
	const { comptroller } = strategy.on_chain_data.smart_contracts as EnzymeSmartContracts;

	return {
		denominationToken: await getDenominationTokenInfo(config, { chainId: chain.id, comptroller })
	};
}
