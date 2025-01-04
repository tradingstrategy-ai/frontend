import type { SmartContracts } from '../schemas/summary';
import type { Chain } from '$lib/helpers/chain';

export const DepositMethod = {
	INTERNAL: 'internal',
	EXTERNAL: 'external',
	NONE: null
} as const;

/**
 * BaseAssetManager functionality is shared across non-vault asset managers
 * (i.e., HotWallet) and vault adapters.
 */
export abstract class BaseAssetManager {
	abstract readonly type: string;
	abstract readonly label: string;
	abstract readonly logoUrl: string;

	abstract readonly depositMethod: (typeof DepositMethod)[keyof typeof DepositMethod];

	constructor(public readonly chain: Chain) {}

	get mode(): string {
		return this.label;
	}

	// override this is subclass if short label should be something different (shorter)
	get shortLabel(): string {
		return this.label;
	}

	get depositEnabled(): boolean {
		return this.depositMethod !== DepositMethod.NONE;
	}

	// FIXME: should not be required on BaseAssetManager
	// - use a type predicate to narrow type when depositEnabled is true
	// - un-comment abstract method definition in BaseVault
	// - remove implementation from HotWallet
	abstract get externalProviderUrl(): string | null;
}

/**
 * BaseVault provides functionality and interfaces used by all vault adapters
 * (e.g., EnzymeVault or VelvetVault)
 */
export abstract class BaseVault<Contracts extends SmartContracts> extends BaseAssetManager {
	constructor(
		chain: Chain,
		protected readonly contracts: Contracts
	) {
		super(chain);
	}

	get mode(): string {
		return `${this.label} vault`;
	}

	// abstract get externalProviderUrl(): string;
}
