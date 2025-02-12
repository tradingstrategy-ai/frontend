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

export type PendingDeposit = DepositResult & {
	settled: boolean;
};

export type SettlementRequired = {
	readonly settlementInfoUrl: string;

	getPendingDeposit(config: Config, address: Address): Promise<PendingDeposit>;

	cancelPendingDeposit(config: Config): Promise<HexString>;

	claimPendingDeposit(config: Config, address: Address, value: bigint): Promise<HexString>;
};
