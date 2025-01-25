import type { SmartContracts, StrategyFees } from '../schemas/summary';
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
	readonly chain: Chain;

	constructor(chain: Chain) {
		this.chain = chain;
	}

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
	abstract readonly address: Address;
	readonly contracts: Contracts;
	#feeData: StrategyFees;

	constructor(chain: Chain, contracts: Contracts, feeData: StrategyFees) {
		super(chain);
		this.contracts = contracts;
		this.#feeData = feeData;
	}

	get mode(): string {
		return `${this.label} vault`;
	}

	abstract get externalProviderUrl(): string;

	async getShareBalance(config: Config, address: Address): Promise<TokenBalance> {
		const { getTokenBalance } = await import('$lib/eth-defi/helpers');
		return getTokenBalance(config, { token: this.address, address });
	}

	abstract getShareValueUSD(config: Config, address: Address): Promise<TokenBalance>;

	// By default, vault adapters return the fees included in metadata payload, plus
	// a vault-specific protocol fee. This can be overridden at the adapter level (e.g.,
	// see lagoon vault adapter)
	async getFees() {
		const fees = this.#feeData;
		return {
			managementFee: fees.management_fee,
			tradingStrategyProtocolFee: fees.trading_strategy_protocol_fee,
			strategyDeveloperFee: fees.strategy_developer_fee,
			totalPerformanceFee: fees.trading_strategy_protocol_fee + fees.strategy_developer_fee
		};
	}
}
