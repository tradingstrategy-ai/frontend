import type { SmartContracts, StrategyFees } from '../schemas/summary';
import type { Chain } from '$lib/helpers/chain';
import type { Config, WriteContractReturnType } from '@wagmi/core';
import type { Log } from 'viem';
import type { TokenBalance, TokenInfo } from '$lib/eth-defi/schemas/token';
import type { SignedArguments } from '$lib/eth-defi/eip-3009';
import type { HexString } from 'trade-executor/schemas/utility-types';
import type { VaultFees, DepositResult, SettlementRequired } from './types';
import { getTokenBalance, getTokenInfo, getTokenAllowance, approveTokenTransfer } from '$lib/eth-defi/helpers';

export const DepositMethod = {
	INTERNAL: 'internal',
	EXTERNAL: 'external'
} as const;

type DepositMethodOption = (typeof DepositMethod)[keyof typeof DepositMethod];

/**
 * Custom error thrown when getSharePrice fails
 */
export class GetSharePriceError extends Error {
	constructor(cause: any) {
		super('Error fetching share price');
		this.name = 'GetSharePriceError';
		this.cause = cause;
	}
}

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

	internalDepositEnabled(): this is VaultWithInternalDeposits<SmartContracts> {
		return this.depositEnabled() && this.depositMethod === DepositMethod.INTERNAL;
	}
}

/**
 * BaseVault provides functionality and interfaces used by all vault adapters
 * (e.g., EnzymeVault or VelvetVault)
 */
export abstract class BaseVault<Contracts extends SmartContracts> extends BaseAssetManager {
	// The vault ERC-20 token address
	abstract readonly address: Address;

	// Whether this vault accepts deposits on Trading Strategy (INTERNAL) or
	// via vault-provider's website (EXTERNAL)
	readonly depositMethod: DepositMethodOption = DepositMethod.EXTERNAL;

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

/**
 * VaultWithInternalDeposits provides functionality used by vault adapters that support
 * internal deposits (e.g., Enzyme, Lagoon)
 */
export abstract class VaultWithInternalDeposits<Contracts extends SmartContracts> extends BaseVault<Contracts> {
	readonly depositMethod = DepositMethod.INTERNAL;
	// temporary hack to support external redemptions on Lagoon
	readonly redeemMethod: DepositMethodOption = DepositMethod.INTERNAL;

	// Used by requiresSettlement() to determine if adapter implements SettlementRequired
	protected readonly _requiresSettlement: boolean = false;

	// The address to which deposit funds are issued (e.g, vault or comptroller)
	abstract readonly payee: Address;

	// Returns the current share price in USD
	abstract getSharePriceUSD(config: Config): Promise<number>;

	// Returns address of the vault's denomination token
	abstract getDenominationAsset(config: Config): Promise<Address>;

	// Submit payment, receive shares (or a pending deposit)
	abstract buyShares(config: Config, buyer: Address, value: bigint): Promise<Address>;

	// Returns the result of a successful deposit, extracted from the transaction logs
	abstract getDepositResult(config: Config, logs: Log[]): Promise<DepositResult>;

	// The address used when forwarding payment authorization (EIP-3009 signature)
	readonly paymentForwarder?: Address = undefined;

	// Type predicate to indicate if adapter implements SettlementRequired
	requiresSettlement(): this is SettlementRequired {
		return this._requiresSettlement;
	}

	// Determine if vault supports payment forwarding (defaults to false)
	async canForwardPayment(_config: Config): Promise<boolean> {
		return false;
	}

	// Determine if vault supports Terms of Service forwarding (defaults to false)
	async canForwardToS(_config: Config): Promise<boolean> {
		return false;
	}

	// Returns vault token info
	async getVaultTokenInfo(config: Config): Promise<TokenInfo> {
		const tokenInfo = await getTokenInfo(config, { chainId: this.chain.id, address: this.address });
		// memoize
		this.getVaultTokenInfo = async () => tokenInfo;
		return tokenInfo;
	}

	// Returns denomination token info
	async getDenominationTokenInfo(config: Config): Promise<TokenInfo> {
		const address = await this.getDenominationAsset(config);
		const tokenInfo = getTokenInfo(config, { chainId: this.chain.id, address });
		// memoize
		this.getDenominationTokenInfo = async () => tokenInfo;
		return tokenInfo;
	}

	// Returns strategy denomination token balance for a given address
	async getDenominationTokenBalance(config: Config, address: Address): Promise<TokenBalance> {
		const token = await this.getDenominationAsset(config);
		return getTokenBalance(config, { chainId: this.chain.id, token, address });
	}

	// Check a wallet address' current deposit allowance
	async getDepositAllowance(config: Config, address: Address): Promise<bigint> {
		return getTokenAllowance(config, {
			chainId: this.chain.id,
			address: await this.getDenominationAsset(config),
			owner: address,
			spender: this.payee
		});
	}

	// Approve deposit allowance through wallet
	async approveDepositAllowance(config: Config, value: number | bigint) {
		return approveTokenTransfer(config, {
			chainId: this.chain.id,
			address: await this.getDenominationAsset(config),
			spender: this.payee,
			value
		});
	}

	// Get EIP-3009 authorization to transfer funds from wallet
	async getTransferAuthorization(config: Config, address: Address, value: bigint) {
		if (!this.paymentForwarder) {
			throw new Error('paymentForwarder is not defined');
		}

		const { getSignedArguments } = await import('$lib/eth-defi/eip-3009');

		return getSignedArguments(config, {
			chainId: this.chain.id,
			token: await this.getDenominationTokenInfo(config),
			transferMethod: 'TransferWithAuthorization',
			from: address,
			to: this.paymentForwarder,
			value
		});
	}

	// Default implementation raises exception for vaults that can't forward payment
	// Vaults returning `true` for `canForwardPayment` should implement (e.g, Enzyme)
	buySharesWithAuthorization(
		_config: Config,
		_signedArgs: SignedArguments,
		_tosHash?: HexString,
		_tosSignature?: HexString
	): Promise<WriteContractReturnType> {
		throw new Error('Method not implemented');
	}
}
