import { BaseVault } from '../base';
import type { VelvetSmartContracts } from 'trade-executor/schemas/summary';

export class VelvetVault extends BaseVault<VelvetSmartContracts> {
	type = 'velvet';
	label = 'Velvet Capital';
	logoUrl = '/logos/tokens/velvet';
}
