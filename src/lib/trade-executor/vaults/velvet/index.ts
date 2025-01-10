import type { VelvetSmartContracts } from 'trade-executor/schemas/summary';
import { BaseVault, DepositMethod } from '../base';

export class VelvetVault extends BaseVault<VelvetSmartContracts> {
	type = 'velvet';
	label = 'Velvet Capital';
	logoUrl = '/logos/tokens/velvet';

	get shortLabel() {
		return 'Velvet';
	}

	depositMethod = DepositMethod.EXTERNAL;

	get externalProviderUrl() {
		return `https://dapp.velvet.capital/VaultDetails/${this.contracts.portfolio}`;
	}

	shareTokenAddress = this.contracts.portfolio;

	async getShareValueUSD() {
		throw new Error('Velvet deposit value not yet available.');
	}
}
