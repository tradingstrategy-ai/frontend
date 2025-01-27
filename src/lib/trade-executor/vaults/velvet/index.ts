import type { VelvetSmartContracts } from 'trade-executor/schemas/summary';
import { BaseVault, DepositMethod } from '../base';

export class VelvetVault extends BaseVault<VelvetSmartContracts> {
	type = 'velvet';
	label = 'Velvet Capital';
	logoUrl = '/logos/tokens/velvet';
	address = this.contracts.portfolio;
	depositMethod = DepositMethod.EXTERNAL;

	// Velvet Capital protocol fee and info
	protocolFee = 0;
	protocolFeeTooltip = 'Velvet Capital protocol fee info TBD.';
	protocolFeeUrl = undefined;

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
