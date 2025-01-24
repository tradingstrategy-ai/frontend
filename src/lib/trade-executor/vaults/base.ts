import type { SmartContracts } from '../schemas/summary';
import type { Chain } from '$lib/helpers/chain';
import type { Config } from '@wagmi/core';
import type { TokenBalance } from '$lib/eth-defi/schemas/token';

export const DepositMethod = {
	INTERNAL: 'internal',
	EXTERNAL: 'external'
} as const;

/**
 * BaseAssetManager functionality is shared across non-vault asset managers
 * (i.e., HotWallet) and vault adapters.
 */
export abstract class BaseAssetManager {
	abstract readonly type: string;
	abstract readonly label: string;
	abstract readonly logoUrl: string;

	constructor(public readonly chain: Chain) {}

	// overridden in BaseVault to append " vault"
	get mode(): string {
		return this.label;
	}

	// override this is subclass if short label should be something different (shorter)
	get shortLabel(): string {
		return this.label;
	}

	depositEnabled(): this is BaseVault<SmartContracts> {
		return this instanceof BaseVault;
	}
}

/**
 * BaseVault provides functionality and interfaces used by all vault adapters
 * (e.g., EnzymeVault or VelvetVault)
 */
export abstract class BaseVault<Contracts extends SmartContracts> extends BaseAssetManager {
	abstract readonly depositMethod: (typeof DepositMethod)[keyof typeof DepositMethod];
	abstract readonly shareTokenAddress: Address;

	constructor(
		chain: Chain,
		protected readonly contracts: Contracts
	) {
		super(chain);
	}

	get mode(): string {
		return `${this.label} vault`;
	}

	abstract get externalProviderUrl(): string;

	async getShareBalance(config: Config, address: Address): Promise<TokenBalance> {
		const { getTokenBalance } = await import('$lib/eth-defi/helpers');
		return getTokenBalance(config, { token: this.shareTokenAddress, address });
	}

	abstract getShareValueUSD(config: Config, address: Address): Promise<TokenBalance>;
}
