/**
 * Vault adapter abstract classes and factory
 *
 */
import type { OnChainData, VaultOnChainData, SmartContracts, StrategyFees } from '../schemas/summary';
import type { BaseAssetManager, BaseVault } from './base';
import { EnzymeVault } from './enzyme';
import { VelvetVault } from './velvet';
import { LagoonVault } from './lagoon';
import { HotWallet } from './hot_wallet';
import { getChain } from '$lib/helpers/chain';

// Overload signatures (helps TS know that vault input -> vault output)
export function createVaultAdapter(onChainData: VaultOnChainData, feeData: StrategyFees): BaseVault<SmartContracts>;
export function createVaultAdapter(onChainData: OnChainData, feeData: StrategyFees): BaseAssetManager;

/**
 * Vault adapter factory - returns the correct vault adapter instance
 * based on the `asset_management_mode` supplied by the strategy metadata.
 */
export function createVaultAdapter(
	{ asset_management_mode: mode, chain_id: chainId, smart_contracts: contracts }: OnChainData,
	feeData: StrategyFees
): BaseAssetManager {
	const chain = getChain(chainId);

	if (!chain) {
		throw new Error(`Chain not found for chainId: ${chainId}`);
	}

	switch (mode) {
		case 'enzyme':
			return new EnzymeVault(chain, contracts, feeData);
		case 'velvet':
			return new VelvetVault(chain, contracts, feeData);
		case 'lagoon':
			return new LagoonVault(chain, contracts, feeData);
		case 'hot_wallet':
			return new HotWallet(chain);
		default:
			throw new Error(`Unsupported asset management mode: ${mode}`);
	}
}
