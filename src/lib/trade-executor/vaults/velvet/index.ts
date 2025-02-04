import type { VelvetSmartContracts } from 'trade-executor/schemas/summary';
import { BaseVault } from '../base';

export class VelvetVault extends BaseVault<VelvetSmartContracts> {
	readonly type = 'velvet';
	readonly label = 'Velvet Capital';
	readonly logoUrl = '/logos/tokens/velvet';
	readonly address = this.contracts.portfolio;

	// Velvet Capital protocol fee and info
	readonly protocolFee = 0.002;
	readonly protocolFeeTooltip = `
		To support further development & future token buy-backs Velvet Capital DeFi execution engine
		takes a 0.2% transaction fee. The fee can be further reduced by staking Velvet tokens (please
		refer to the Tokenomics section).
	`;
	readonly protocolFeeUrl = 'https://docs.velvet.capital/product/fees';

	get shortLabel() {
		return 'Velvet';
	}

	get externalProviderUrl() {
		return `https://dapp.velvet.capital/VaultDetails/${this.contracts.portfolio}`;
	}
}
