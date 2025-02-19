import type { Config } from '@wagmi/core';
import type { TokenBalance } from '$lib/eth-defi/schemas/token';
import type { HexString } from 'trade-executor/schemas/utility-types';

export type VaultFees = {
	managementFee: number;
	totalPerformanceFee: number;
	tradingStrategyProtocolFee?: number;
	strategyDeveloperFee?: number;
};

export type DepositResult = {
	assets: TokenBalance;
	shares: TokenBalance;
};

export type PendingExchange = {
	type: 'deposit' | 'redemption';
	assets: TokenBalance;
	shares: TokenBalance;
	settled: boolean;
};

export type PendingRedemption = PendingExchange;

export type RedemptionResult = {
	sharesRedeemed: TokenBalance;
	assetsReceived: TokenBalance[];
	estimatedValue: TokenBalance;
};

export type SettlementRequired = {
	readonly settlementInfoUrl: string;

	getPendingDeposit(config: Config, address: Address): Promise<PendingExchange>;

	cancelPendingDeposit(config: Config): Promise<HexString>;

	claimPendingDeposit(config: Config, address: Address, value: bigint): Promise<HexString>;

	getPendingRedemption(config: Config, address: Address): Promise<PendingRedemption>;

	claimPendingRedemption(config: Config, address: Address, value: bigint): Promise<HexString>;
};
