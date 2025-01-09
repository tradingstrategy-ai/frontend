import type { LagoonSmartContracts } from 'trade-executor/schemas/summary';
import { BaseVault, DepositMethod } from '../base';

export class LagoonVault extends BaseVault<LagoonSmartContracts> {
	type = 'lagoon';
	label = 'Lagoon';
	logoUrl = '/logos/tokens/lagoon';

	depositMethod = DepositMethod.EXTERNAL;

	get externalProviderUrl() {
		return `https://app.lagoon.finance/vault/${this.chain.id}/${this.contracts.address}`;
	}

	shareTokenAddress = this.contracts.address;

	async getShareValueUSD() {
		throw new Error('Lagoon deposit value not yet available.');
		return undefined;
	}
}
