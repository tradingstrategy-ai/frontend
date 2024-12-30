import type { ConnectedStrategyInfo } from 'trade-executor/models/strategy-info';
import { getChain } from '$lib/helpers/chain';

/**
 * Return a vault URL based on the strategy's vault type (e.g., Enzyme), vault address and chain
 */
export function getVaultUrl({ on_chain_data }: ConnectedStrategyInfo) {
	const { chain_id, asset_management_mode, smart_contracts } = on_chain_data;
	const chain = getChain(chain_id);
	if (!chain) return;

	switch (asset_management_mode) {
		case 'enzyme':
			return `https://app.enzyme.finance/vault/${smart_contracts.vault}?network=${chain.slug}`;
		case 'velvet':
			return `https://dapp.velvet.capital/VaultDetails/${smart_contracts.portfolio}`;
	}
}
