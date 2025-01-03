import { BaseVault } from '../base';
import type { EnzymeSmartContracts } from 'trade-executor/schemas/summary';

export class EnzymeVault extends BaseVault<EnzymeSmartContracts> {
	type = 'enzyme';
	label = 'Enzyme';
	logoUrl = '/logos/tokens/enzyme';
}
