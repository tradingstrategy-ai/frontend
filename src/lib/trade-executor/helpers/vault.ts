import type { ConnectedStrategyRuntimeState } from 'trade-executor/strategy/runtime-state';
import { getChain } from '$lib/helpers/chain';

/**
 * Return a vault URL based on the strategy's vault type (e.g., Enzyme), vault address and chain
 */
export function getVaultUrl({ on_chain_data }: ConnectedStrategyRuntimeState) {
	const address = on_chain_data.smart_contracts.vault;
	const chain = getChain(on_chain_data.chain_id);
	const mode = on_chain_data.asset_management_mode;

	if (!chain || !address) return;

	if (mode === 'enzyme') {
		return `https://app.enzyme.finance/vault/${address}?network=${chain.slug}`;
	}
}
