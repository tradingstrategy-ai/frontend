import type { SmartContracts, StrategyFees } from '../schemas/summary';
import type { Chain } from '$lib/helpers/chain';
import type { Config } from '@wagmi/core';
import type { TokenBalance } from '$lib/eth-defi/schemas/token';

export type VaultFees = {
	managementFee: number;
	totalPerformanceFee: number;
	tradingStrategyProtocolFee?: number;
	strategyDeveloperFee?: number;
};

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

	// Used for displaying the asset management mode.
	// Overridden in BaseVault to append " vault"
	get mode(): string {
		return this.label;
	}

	// Override this is subclass if short label should be something different (shorter)
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
	// Returns the vault ERC-20 token address (the specific contract address property
	// differs by vault-type)
	abstract readonly address: Address;

	// Whether this vault accepts deposits on Trading Strategy (INTERNAL) or
	// via vault-provider's website (EXTERNAL)
	abstract readonly depositMethod: (typeof DepositMethod)[keyof typeof DepositMethod];

	// Vault-specific protocol fee and info
	abstract readonly protocolFee: number;
	abstract readonly protocolFeeTooltip: string;
	abstract readonly protocolFeeUrl?: string;

	// Common properties set in the constructor
	readonly contracts: Contracts;
	protected readonly feeData: StrategyFees;

	constructor(chain: Chain, contracts: Contracts, feeData: StrategyFees) {
		super(chain);
		this.contracts = contracts;
		this.feeData = feeData;
	}

	// Return a given vault's URL on vault provider's website
	abstract get externalProviderUrl(): string;

	// Return a wallet's share value in USD
	abstract getShareValueUSD(config: Config, address: Address): Promise<TokenBalance>;

	// Used for displaying the asset management mode.
	// Appends " vault" to label for vaults.
	get mode(): string {
		return `${this.label} vault`;
	}

	// Returns a wallet's vault share balance
	async getShareBalance(config: Config, address: Address): Promise<TokenBalance> {
		const { getTokenBalance } = await import('$lib/eth-defi/helpers');
		return getTokenBalance(config, { token: this.address, address });
	}

	// By default, vault adapters return the fees defined in metadata payload. This
	// can be overridden at the adapter level (e.g., see lagoon vault adapter).
	async getFees(_config: Config): Promise<VaultFees> {
		const fees = this.feeData;
		return {
			managementFee: fees.management_fee,
			totalPerformanceFee: fees.trading_strategy_protocol_fee + fees.strategy_developer_fee,
			tradingStrategyProtocolFee: fees.trading_strategy_protocol_fee,
			strategyDeveloperFee: fees.strategy_developer_fee
		};
	}
}
