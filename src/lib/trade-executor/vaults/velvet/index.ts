import { BaseVault, DepositMethod } from '../base';
import type { VelvetSmartContracts } from 'trade-executor/schemas/summary';

export class VelvetVault extends BaseVault<VelvetSmartContracts> {
	type = 'velvet';
	label = 'Velvet Capital';
	logoUrl = '/logos/tokens/velvet';

	depositMethod = DepositMethod.EXTERNAL;

	get shortLabel(): string {
		return 'Velvet';
	}

	get externalProviderUrl() {
		return `https://dapp.velvet.capital/VaultDetails/${this.contracts.portfolio}`;
	}
}
