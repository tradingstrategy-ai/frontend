import { BaseVault, DepositMethod } from '../base';
import type { EnzymeSmartContracts } from 'trade-executor/schemas/summary';

export class EnzymeVault extends BaseVault<EnzymeSmartContracts> {
	type = 'enzyme';
	label = 'Enzyme';
	logoUrl = '/logos/tokens/enzyme';

	depositMethod = DepositMethod.INTERNAL;

	get externalProviderUrl() {
		return `https://app.enzyme.finance/vault/${this.contracts.vault}?network=${this.chain.slug}`;
	}
}
