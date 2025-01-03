import type { SmartContracts } from '../schemas/summary';

/**
 * BaseAssetManager functionality is shared across non-vault asset managers
 * (i.e., HotWallet) and vault adapters.
 */
export abstract class BaseAssetManager {
	abstract readonly type: string;
	abstract readonly label: string;
	abstract readonly logoUrl: string;

	constructor(public readonly chainId: number) {}

	get mode(): string {
		return this.label;
	}
}

/**
 * BaseVault provides functionality and interfaces used by all vault adapters
 * (e.g., EnzymeVault or VelvetVault)
 */
export abstract class BaseVault<Contracts extends SmartContracts> extends BaseAssetManager {
	constructor(
		chainId: number,
		protected readonly contracts: Contracts
	) {
		super(chainId);
	}

	get mode(): string {
		return `${this.label} vault`;
	}
}
