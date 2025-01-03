/**
 * Vault adapter abstract classes and factory
 *
 */
import type { OnChainData } from '../schemas/summary';
import type { BaseAssetManager } from './base';
import { EnzymeVault } from './enzyme';
import { VelvetVault } from './velvet';
import { HotWallet } from './hot_wallet';

/**
 * Vault adapter factory - returns the correct vault adapter instance
 * based on the `asset_management_mode` supplied by the strategy metadata.
 */
export function createVaultAdapter({
	asset_management_mode: mode,
	chain_id: chainId,
	smart_contracts: contracts
}: OnChainData): BaseAssetManager {
	switch (mode) {
		case 'enzyme':
			return new EnzymeVault(chainId, contracts);
		case 'velvet':
			return new VelvetVault(chainId, contracts);
		case 'hot_wallet':
			return new HotWallet(chainId);
		default:
			throw new Error(`Unsupported asset management mode: ${mode}`);
	}
}
