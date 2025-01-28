import type { VelvetSmartContracts } from 'trade-executor/schemas/summary';
import { BaseVault, DepositMethod } from '../base';

export class VelvetVault extends BaseVault<VelvetSmartContracts> {
	type = 'velvet';
	label = 'Velvet Capital';
	logoUrl = '/logos/tokens/velvet';
	address = this.contracts.portfolio;
	depositMethod = DepositMethod.EXTERNAL;

	// Velvet Capital protocol fee and info
	protocolFee = 0.002;
	protocolFeeTooltip = `
		To support further development & future token buy-backs Velvet Capital DeFi execution engine
		takes a 0.2% transaction fee. The fee can be further reduced by staking Velvet tokens (please
		refer to the Tokenomics section).
	`;
	protocolFeeUrl = 'https://docs.velvet.capital/product/fees';

	get shortLabel() {
		return 'Velvet';
	}

	get externalProviderUrl() {
		return `https://dapp.velvet.capital/VaultDetails/${this.contracts.portfolio}`;
	}

	async getShareValueUSD() {
		throw new Error('Velvet deposit value not yet available.');
	}
}
